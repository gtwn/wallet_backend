
export default async function checkSize(request) {

    let base64String = request.file;
    console.log(request.file.split(',')[0])

    let stringLength = base64String.length - request.file.split(',')[0].length + 1;

    let sizeInBytes = 4 * Math.ceil((stringLength / 3)) * 0.5624896334383812;
    let sizeInKb = sizeInBytes / 1000;
    if (sizeInKb > 5000) return true;
    return false;
}