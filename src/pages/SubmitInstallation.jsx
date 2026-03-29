import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Installation, InstallerProfile } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sun, Zap, Battery, MapPin, Loader2, CheckCircle, AlertCircle, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { COUNTRIES, INSTALLATION_TYPES } from '@/lib/constants';

const batteryTypes = ['Lithium-ion', 'Lead-acid', 'Gel', 'AGM', 'LiFePO4', 'None'];
const inverterBrands = ['Victron', 'SMA', 'Fronius', 'Growatt', 'Huawei', 'Deye', 'Sunsynk', 'Felicity', 'Other'];
const solarPanelBrands = ['Jinko', 'Canadian Solar', 'Longi', 'Trina', 'JA Solar', 'SunPower', 'Other'];
const batteryBrands = ['Pylontech', 'BYD', 'Felicity', 'LG Chem', 'Tesla', 'KiloVault', 'Other'];

/**
 * @typedef {Object} InstallationFormData
 * @property {string} country
 * @property {string} state
 * @property {string} city
 * @property {string} installation_type
 * @property {string} system_size_kva
 * @property {string} number_of_panels
 * @property {string} panel_wattage
 * @property {string} solar_panel_brand
 * @property {string} battery_type
 * @property {string} battery_brand
 * @property {string} battery_capacity_kwh
 * @property {string} number_of_batteries
 * @property {string} battery_capacity_each
 * @property {string} number_of_inverters
 * @property {string} inverter_capacity_kva
 * @property {string} inverter_brand
 * @property {string} installation_date
 */

export default function SubmitInstallation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  /** @type {[InstallationFormData, React.Dispatch<React.SetStateAction<InstallationFormData>>]} */
  const [formData, setFormData] = useState({
    country: '',
    state: '',
    city: '',
    installation_type: '',
    system_size_kva: '',
    number_of_panels: '',
    panel_wattage: '',
    solar_panel_brand: '',
    battery_type: '',
    battery_brand: '',
    battery_capacity_kwh: '',
    number_of_batteries: '',
    battery_capacity_each: '',
    number_of_inverters: '',
    inverter_capacity_kva: '',
    inverter_brand: '',
    installation_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: myProfile } = useQuery({
    queryKey: ['my-installer-profile', user?.email],
    queryFn: async () => {
      const profiles = await InstallerProfile.filter({ created_by: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: existingInstallation, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['installation', editId],
    queryFn: async () => {
      const data = await Installation.filter({ id: editId });
      return data[0];
    },
    enabled: !!editId,
  });

  useEffect(() => {
    if (existingInstallation) {
      setFormData({
        country: existingInstallation.country || '',
        state: existingInstallation.state || '',
        city: existingInstallation.city || '',
        installation_type: existingInstallation.installation_type || '',
        system_size_kva: existingInstallation.system_size_kva?.toString() || '',
        number_of_panels: existingInstallation.number_of_panels?.toString() || '',
        panel_wattage: existingInstallation.panel_wattage?.toString() || '',
        solar_panel_brand: existingInstallation.solar_panel_brand || '',
        battery_type: existingInstallation.battery_type || '',
        battery_brand: existingInstallation.battery_brand || '',
        battery_capacity_kwh: existingInstallation.battery_capacity_kwh?.toString() || '',
        number_of_batteries: existingInstallation.number_of_batteries?.toString() || '',
        battery_capacity_each: existingInstallation.battery_capacity_each?.toString() || '',
        number_of_inverters: existingInstallation.number_of_inverters?.toString() || '',
        inverter_capacity_kva: existingInstallation.inverter_capacity_kva?.toString() || '',
        inverter_brand: existingInstallation.inverter_brand || '',
        installation_date: existingInstallation.installation_date || format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [existingInstallation]);

  const createInstallationMutation = useMutation({
    /** @param {Record<string, any>} data */
    mutationFn: async (data) => {
      return await Installation.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installations'] });
      toast.success('Installation submitted for review!');
      navigate(createPageUrl('Analytics'));
    },
    onError: () => {
      toast.error('Failed to submit installation');
    },
  });

  const updateInstallationMutation = useMutation({
    /** @param {Record<string, any>} data */
    mutationFn: async (data) => {
      return await Installation.update(editId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installations'] });
      toast.success('Installation re-submitted for review!');
      navigate(createPageUrl('Analytics'));
    },
    onError: () => {
      toast.error('Failed to update installation');
    },
  });

  /** @param {React.FormEvent<HTMLFormElement>} e */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.country || !formData.installation_type || !formData.system_size_kva || !formData.number_of_panels) {
      toast.error('Please fill in all required fields');
      return;
    }

    const systemKva = parseFloat(formData.system_size_kva) || 0;
    const carbonOffsetAnnual = systemKva * 1.0;
    const carbonOffsetLifetime = carbonOffsetAnnual * 25;

    const payload = {
      ...formData,
      created_by: user?.email,
      installer_profile_id: myProfile?.id,
      system_size_kva: systemKva,
      number_of_panels: parseInt(formData.number_of_panels) || 0,
      panel_wattage: parseInt(formData.panel_wattage) || 0,
      battery_capacity_kwh: parseFloat(formData.battery_capacity_kwh) || 0,
      number_of_batteries: parseInt(formData.number_of_batteries) || 0,
      inverter_capacity_kva: parseFloat(formData.inverter_capacity_kva) || 0,
      carbon_offset_tons_annual: carbonOffsetAnnual,
      carbon_offset_lifetime: carbonOffsetLifetime,
      status: 'pending',
    };

    if (editId) {
      updateInstallationMutation.mutate(payload);
    } else {
      createInstallationMutation.mutate(payload);
    }
  };

  /** @param {keyof InstallationFormData} field @param {string} value */
  const updateField = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      if (field === 'number_of_inverters' || field === 'inverter_capacity_kva') {
        const numInverters = parseFloat(field === 'number_of_inverters' ? value : updated.number_of_inverters) || 0;
        const inverterKva = parseFloat(field === 'inverter_capacity_kva' ? value : updated.inverter_capacity_kva) || 0;
        updated.system_size_kva = (numInverters * inverterKva).toString();
      }

      if (field === 'number_of_batteries' || field === 'battery_capacity_each') {
        const numBatteries = parseFloat(field === 'number_of_batteries' ? value : updated.number_of_batteries) || 0;
        const capacityEach = parseFloat(field === 'battery_capacity_each' ? value : updated.battery_capacity_each) || 0;
        updated.battery_capacity_kwh = (numBatteries * capacityEach).toString();
      }

      return updated;
    });
  };

  if (isLoadingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPending = createInstallationMutation.isPending || updateInstallationMutation.isPending;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-3xl">
        {!myProfile && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Create your installer profile first</p>
                <p className="text-sm text-muted-foreground">
                  Your installations will be linked to your profile on the leaderboard.
                </p>
              </div>
              <Button onClick={() => navigate(createPageUrl('InstallerSignup'))} variant="outline">
                Create Profile
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-border">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sun className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{editId ? 'Update Installation' : 'Submit Installation'}</CardTitle>
            <CardDescription>
              {editId ? 'Update the details to re-submit your installation for review' : 'Add a new solar installation to Africa\'s registry'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Country *</Label>
                    <Select value={formData.country} onValueChange={(v) => updateField('country', v)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>State/Province</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="State"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="City"
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* System */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  System Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Installation Type *</Label>
                    <Select value={formData.installation_type} onValueChange={(v) => updateField('installation_type', v)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {INSTALLATION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2 border-t border-border pt-4 mt-2">
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Inverter Configuration</h4>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Inverter Brand</Label>
                    <Select value={formData.inverter_brand} onValueChange={(v) => updateField('inverter_brand', v)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {inverterBrands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Inverters *</Label>
                    <Input
                      type="number" min="0"
                      value={formData.number_of_inverters}
                      onChange={(e) => updateField('number_of_inverters', e.target.value)}
                      placeholder="e.g., 2"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Inverter Capacity (kVA) *</Label>
                    <Input
                      type="number" min="0" step="0.1"
                      value={formData.inverter_capacity_kva}
                      onChange={(e) => updateField('inverter_capacity_kva', e.target.value)}
                      placeholder="e.g., 5"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>System Size (kVA) - Calculated</Label>
                    <Input
                      type="number"
                      value={formData.system_size_kva}
                      readOnly
                      placeholder="Auto-calculated"
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2 border-t border-border pt-4 mt-2">
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Solar Panel Configuration</h4>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Solar Panel Brand</Label>
                    <Select value={formData.solar_panel_brand} onValueChange={(v) => updateField('solar_panel_brand', v)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {solarPanelBrands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Panels *</Label>
                    <Input
                      type="number" min="0"
                      value={formData.number_of_panels}
                      onChange={(e) => updateField('number_of_panels', e.target.value)}
                      placeholder="e.g., 12"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Panel Wattage (W)</Label>
                    <Input
                      type="number" min="0"
                      value={formData.panel_wattage}
                      onChange={(e) => updateField('panel_wattage', e.target.value)}
                      placeholder="e.g., 450"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2 mt-4">
                    <Label>Installation Date</Label>
                    <Input
                      type="date"
                      value={formData.installation_date}
                      onChange={(e) => updateField('installation_date', e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Battery */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Battery className="w-5 h-5 text-accent" />
                  Battery Storage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Battery Brand</Label>
                    <Select value={formData.battery_brand} onValueChange={(v) => updateField('battery_brand', v)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {batteryBrands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Battery Type</Label>
                    <Select value={formData.battery_type} onValueChange={(v) => updateField('battery_type', v)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {batteryTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Batteries</Label>
                    <Input
                      type="number" min="0"
                      value={formData.number_of_batteries}
                      onChange={(e) => updateField('number_of_batteries', e.target.value)}
                      placeholder="e.g., 4"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity per Battery (kWh)</Label>
                    <Input
                      type="number" min="0" step="0.1"
                      value={formData.battery_capacity_each}
                      onChange={(e) => updateField('battery_capacity_each', e.target.value)}
                      placeholder="e.g., 2.5"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Total Capacity (kWh) - Calculated</Label>
                    <Input
                      type="number"
                      value={formData.battery_capacity_kwh}
                      readOnly
                      placeholder="Auto-calculated"
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>

              {/* Carbon Preview */}
              {formData.system_size_kva && (
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-5 h-5 text-accent" />
                    <span className="font-medium text-foreground">Environmental Impact</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Annual CO₂ Offset</div>
                      <div className="text-lg font-semibold text-accent">
                        {(parseFloat(formData.system_size_kva) * 1.0).toFixed(1)} tons/year
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Lifetime CO₂ Offset (25yr)</div>
                      <div className="text-lg font-semibold text-accent">
                        {(parseFloat(formData.system_size_kva) * 25).toFixed(0)} tons
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Carbon Credit Value</div>
                      <div className="text-lg font-semibold text-primary">
                        ${(parseFloat(formData.system_size_kva) * 25 * 15).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Trees Equivalent</div>
                      <div className="text-lg font-semibold text-accent">
                        {Math.round(parseFloat(formData.system_size_kva) * 25 * 48).toLocaleString()} trees
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 py-6 text-lg"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {editId ? 'Resubmit Installation' : 'Submit Installation'}
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-3">
                  Your submission will be reviewed by an admin before appearing on the dashboard.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
