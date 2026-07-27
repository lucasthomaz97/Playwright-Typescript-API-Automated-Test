export interface Order {
    id: number;
    user_id: number;
    product_id: number;
    quantity: number;
    total: string;
    created_at: string;
    user_name?: string;
    user_email?: string;
    product_name?: string;
    product_price?: string;
}
