export default async function CheckEmail(request) {
    // isValid = true       notValid = false
    if(/\S+@\S+\.\S+/.test(request))return false
    return true
}