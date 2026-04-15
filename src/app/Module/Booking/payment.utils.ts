import SSLCommerzPayment from "sslcommerz-lts";
import { envConfig } from "../../config/env";

// Initialize SSLCommerz instance
export const initSSLCommerz = () => {
    const store_id = envConfig.store_id;
    const store_passwd = envConfig.store_pass;
    const is_live = envConfig.is_live;

    return new SSLCommerzPayment(store_id, store_passwd, is_live);
};
