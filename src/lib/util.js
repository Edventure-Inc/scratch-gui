export const getQueryString = name => {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
    const query = window.location.search.substr(1).match(reg);
    if (query !== null) {
        return decodeURIComponent(query[2]);
    }
    return null;
};
