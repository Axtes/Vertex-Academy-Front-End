export class Pagination {

    constructor(pageData) {
        this.data = pageData;
    }

    get items() {
        return this.data.content;
    }

    get page() {
        return this.data.number;
    }

    get totalPages() {
        return this.data.totalPages;
    }

    hasNext() {
        return this.page < this.totalPages - 1;
    }

    hasPrev() {
        return this.page > 0;
    }
}