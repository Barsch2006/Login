exports.User = class User {
    req_user
    groups

    constructor(user) {
        this.req_user = user;
        this.groups = this.req_user.groups.split(',')
    }
}