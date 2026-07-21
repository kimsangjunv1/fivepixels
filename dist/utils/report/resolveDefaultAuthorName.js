export function resolveDefaultAuthorName(identify, authors, selfName) {
    if (identify?.name) {
        return identify.name;
    }
    return authors[0]?.name ?? selfName ?? "";
}
//# sourceMappingURL=resolveDefaultAuthorName.js.map