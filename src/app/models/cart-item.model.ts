export interface CartItem {
    id: number;
    quantity: number;
    name: string;
    photo: string | null;
    price: number;
    discounted: number;
    discount: number;
    total: number;
    requestedSize?: string;
    sizes?: any[];
}
