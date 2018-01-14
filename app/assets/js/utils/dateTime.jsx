const options = {
    shortDateTime: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    },
    shortDate: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    },
};

export function getShortDateTime(dateTime) {
    const date = new Date(dateTime);
    const formattedDateTime = date.toLocaleDateString('fi-FI', options.shortDateTime);
    return formattedDateTime;
}