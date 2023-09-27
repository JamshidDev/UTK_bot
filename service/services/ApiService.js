const axios = require("../index");



const get_organizations = async (payload) => {
    return await axios.get(`/api/organizations`, { params: payload }).then((res) => {
        return [null, res.data.organization]
    }).catch((error) => {
        return [error, null]
    })
}

const chek_user = async (payload) => {
    return await axios.post(`/api/check-user`, payload.data).then((res) => {
        return [null, res.data]
    }).catch((error) => {
        return [error, null]
    })
}

const chek_user_salary = async (payload) => {
    return await axios.post(`/api/check-accountant-info`, payload.data).then((res) => {
        return [null, res.data]
    }).catch((error) => {
        return [error, null]
    })
}

const chek_register_user = async (payload) => {
    return await axios.post(`/api/check-telegram-user`, payload.data).then((res) => {
        return [null, res.data]
    }).catch((error) => {
        return [error, null]
    })
}

const logout_user = async (payload) => {
    return await axios.post(`/api/logout-telegram-user`, payload.data).then((res) => {
        return [null, res.data]
    }).catch((error) => {
        return [error, null]
    })
}




module.exports = { get_organizations, chek_user, chek_user_salary,chek_register_user, logout_user }