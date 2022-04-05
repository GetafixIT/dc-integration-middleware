export const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

export const formatMoneyString = (money, args?) => {
    args = args || {
        currency: 'USD',
        locale: 'en-US'
    }
    return new Intl.NumberFormat(args.locale, {
        style: 'currency',
        currency: args.currency
    }).format(money);
}
