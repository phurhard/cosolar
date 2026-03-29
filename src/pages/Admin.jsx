import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Installation, InstallerProfile, sendInstallationReviewEmail, supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  CheckCircle, XCircle, Clock, Loader2, Download,
  Zap, Search, Leaf
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

/**
 * @typedef {Object} InstallationReviewInput
 * @property {string} id
 * @property {Record<string, any>} data
 */

/**
 * @typedef {Object} ProfileRefreshInput
 * @property {string} id
 */

export default function Admin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    installation: null,
    status: 'approved',
    comment: '',
  });

  const { data: pendingInstallations = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-installations'],
    queryFn: () => Installation.filter({ status: 'pending' }),
  });

  const { data: allInstallations = [] } = useQuery({
    queryKey: ['all-installations'],
    queryFn: () => Installation.list(),
  });

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const channel = supabase
      .channel('admin-installations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'installations',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.info('New installation submitted for review');
          }
          queryClient.invalidateQueries({ queryKey: ['pending-installations'] });
          queryClient.invalidateQueries({ queryKey: ['all-installations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.role, queryClient]);

  const reviewInstallationMutation = useMutation({
    /** @param {InstallationReviewInput} input */
    mutationFn: async ({ id, data }) => {
      const updatedInstallation = await Installation.review({
        id,
        status: data.status,
        comment: data.comment,
        adminEmail: user?.email,
      });

      try {
        await sendInstallationReviewEmail({
          installationId: updatedInstallation.id,
          requesterEmail: updatedInstallation.created_by,
          status: updatedInstallation.status,
          comment: updatedInstallation.admin_review_comment,
          adminEmail: updatedInstallation.reviewed_by,
          installationType: updatedInstallation.installation_type,
          location: [updatedInstallation.city, updatedInstallation.state, updatedInstallation.country]
            .filter(Boolean)
            .join(', '),
        });
      } catch (emailError) {
        console.error('Failed to send installation review email', emailError);
        toast.error('Review saved, but the email notification could not be sent.');
      }

      return updatedInstallation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-installations'] });
      queryClient.invalidateQueries({ queryKey: ['all-installations'] });
      toast.success('Installation updated');
    },
  });

  const refreshProfileStatsMutation = useMutation({
    /** @param {ProfileRefreshInput} input */
    mutationFn: async ({ id }) => {
      // Recalculate stats
      const installations = await Installation.filter({ installer_profile_id: id, status: 'approved' });
      const totalCarbonAnnual = installations.reduce((sum, i) => sum + (i.carbon_offset_tons_annual || i.system_size_kva || 0), 0);
      const totalCarbonLifetime = installations.reduce((sum, i) => sum + (i.carbon_offset_lifetime || (i.system_size_kva * 25) || 0), 0);
      const stats = {
        total_kva: installations.reduce((sum, i) => sum + (i.system_size_kva || 0), 0),
        total_panels: installations.reduce((sum, i) => sum + (i.number_of_panels || 0), 0),
        total_batteries: installations.reduce((sum, i) => sum + (i.number_of_batteries || 0), 0),
        total_installations: installations.length,
        total_carbon_offset_tons: totalCarbonAnnual,
        total_carbon_offset_lifetime: totalCarbonLifetime,
        carbon_credit_value_usd: Math.round(totalCarbonLifetime * 15),
      };
      await InstallerProfile.update(id, stats);
    },
    onSuccess: () => {
      toast.success('Installer totals refreshed');
    },
  });

  const openReviewDialog = (installation, status) => {
    setReviewDialog({
      open: true,
      installation,
      status,
      comment: installation?.admin_review_comment || '',
    });
  };

  const closeReviewDialog = () => {
    setReviewDialog({
      open: false,
      installation: null,
      status: 'approved',
      comment: '',
    });
  };

  const submitReview = async () => {
    if (!reviewDialog.installation) return;

    if (!reviewDialog.comment.trim()) {
      toast.error('Please add a comment for the requester');
      return;
    }

    await reviewInstallationMutation.mutateAsync({
      id: reviewDialog.installation.id,
      data: {
        status: reviewDialog.status,
        comment: reviewDialog.comment.trim(),
      }
    });

    if (reviewDialog.status === 'approved' && reviewDialog.installation.installer_profile_id) {
      await refreshProfileStatsMutation.mutateAsync({ id: reviewDialog.installation.installer_profile_id });
    }

    closeReviewDialog();
  };

  const exportToCSV = () => {
    const headers = ['Country', 'State', 'City', 'Type', 'kVA', 'Panels', 'Batteries', 'Date', 'Status'];
    const rows = allInstallations.map(i => [
      i.country, i.state, i.city, i.installation_type,
      i.system_size_kva, i.number_of_panels, i.number_of_batteries,
      i.installation_date, i.status
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosolar-installations-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Data exported');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    pending: pendingInstallations.length,
    approved: allInstallations.filter(i => i.status === 'approved').length,
    totalKva: allInstallations.filter(i => i.status === 'approved').reduce((sum, i) => sum + (i.system_size_kva || 0), 0),
    carbonOffset: Math.round(allInstallations.filter(i => i.status === 'approved').reduce((sum, i) => sum + (i.carbon_offset_tons_annual || i.system_size_kva || 0), 0)),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Review</h1>
            <p className="text-muted-foreground">Approve and reject submitted installations</p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-accent" />
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.approved}</div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <Zap className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.totalKva.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total kVA</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4 flex items-center gap-4">
              <Leaf className="w-8 h-8 text-accent" />
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.carbonOffset.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">CO₂ Tons/Yr</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending ({pendingInstallations.length})</TabsTrigger>
            <TabsTrigger value="all">All Installations</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : pendingInstallations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-accent" />
                  No pending installations to review
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingInstallations.map(inst => (
                  <Card key={inst.id} className="border-primary/30">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{inst.installation_type}</Badge>
                            <Badge variant="outline">{inst.country}</Badge>
                          </div>
                          <div className="text-lg font-medium text-foreground">
                            {inst.city}, {inst.state}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {inst.system_size_kva} kVA • {inst.number_of_panels} panels • {inst.number_of_batteries || 0} batteries
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Submitted: {format(new Date(inst.created_at), 'PPp')}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => openReviewDialog(inst, 'approved')}
                            className="bg-accent hover:bg-accent/90"
                            disabled={reviewInstallationMutation.isPending || refreshProfileStatsMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => openReviewDialog(inst, 'rejected')}
                            variant="destructive"
                            disabled={reviewInstallationMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search installations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-3 text-muted-foreground font-medium">Location</th>
                        <th className="pb-3 text-muted-foreground font-medium">Type</th>
                        <th className="pb-3 text-muted-foreground font-medium">kVA</th>
                        <th className="pb-3 text-muted-foreground font-medium">Panels</th>
                        <th className="pb-3 text-muted-foreground font-medium">Status</th>
                        <th className="pb-3 text-muted-foreground font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {allInstallations
                        .filter(i =>
                          i.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.state?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .slice(0, 50)
                        .map(inst => (
                          <tr key={inst.id}>
                            <td className="py-3">
                              <span className="font-medium">{inst.city}</span>
                              <span className="text-muted-foreground">, {inst.country}</span>
                            </td>
                            <td className="py-3">{inst.installation_type}</td>
                            <td className="py-3">{inst.system_size_kva}</td>
                            <td className="py-3">{inst.number_of_panels}</td>
                            <td className="py-3">
                              <Badge variant={
                                inst.status === 'approved' ? 'default' :
                                inst.status === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {inst.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-muted-foreground">
                              {inst.installation_date && format(new Date(inst.installation_date), 'PP')}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={reviewDialog.open} onOpenChange={(open) => !open && closeReviewDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.status === 'approved' ? 'Approve installation' : 'Reject installation'}
            </DialogTitle>
            <DialogDescription>
              Add a comment for the requester. This will appear in-app and be sent by email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {reviewDialog.installation && (
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                <div className="font-medium text-foreground">
                  {reviewDialog.installation.installation_type || 'Installation review'}
                </div>
                <div className="text-muted-foreground">
                  {[reviewDialog.installation.city, reviewDialog.installation.state, reviewDialog.installation.country]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="review-comment" className="text-sm font-medium text-foreground">
                Comment
              </label>
              <Textarea
                id="review-comment"
                value={reviewDialog.comment}
                onChange={(e) => setReviewDialog(prev => ({ ...prev, comment: e.target.value }))}
                placeholder={
                  reviewDialog.status === 'approved'
                    ? 'Example: Approved after verifying the project details.'
                    : 'Example: Please correct the project size and location details, then resubmit.'
                }
                className="min-h-32"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeReviewDialog} disabled={reviewInstallationMutation.isPending || refreshProfileStatsMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              variant={reviewDialog.status === 'approved' ? 'default' : 'destructive'}
              disabled={reviewInstallationMutation.isPending || refreshProfileStatsMutation.isPending}
            >
              {(reviewInstallationMutation.isPending || refreshProfileStatsMutation.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {reviewDialog.status === 'approved' ? 'Approve with comment' : 'Reject with comment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
