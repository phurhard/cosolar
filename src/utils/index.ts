export function createPageUrl(pageName: string) {
    return '/' + pageName
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/ /g, '-')
        .toLowerCase();
}
