import ListProduct from "@/components/list-product";
import db from "@/lib/db";

async function getProduct() {
    const product = await db.product.findMany({
        select: {
            id: true,
            title: true,
            price: true,
            created_at: true,
            photo: true,
        },
    });
    return product;
}

export default async function Products() {
    const product = await getProduct();
    return (
        <div className="p-5 flex flex-col gap-5">
            {product.map((product) => (
                <ListProduct key={product.id} {...product} />
            ))}
        </div>
    );
}
