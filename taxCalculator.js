class TaxCalculator {
    static TPS_RATE = 0.05;    // 5%
    static TVQ_RATE = 0.09975; // 9.975%

    static calculateTaxes(subtotal) {
        const tps = subtotal * this.TPS_RATE;
        const tvq = subtotal * this.TVQ_RATE;
        
        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            tps: parseFloat(tps.toFixed(2)),
            tvq: parseFloat(tvq.toFixed(2)),
            total: parseFloat((subtotal + tps + tvq).toFixed(2))
        };
    }
}
