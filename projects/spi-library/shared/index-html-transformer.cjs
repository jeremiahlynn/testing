module.exports = async (_targetOptions, indexHtmlContent) => {
    indexHtmlContent = indexHtmlContent.replace(/type="module"/g, '');
    return indexHtmlContent;
};
