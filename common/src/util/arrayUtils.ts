export class ArrayUtils {
     static groupBy(xs: any[], key: string) {
        return xs.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x)
            return rv
        }, {})
    }
}