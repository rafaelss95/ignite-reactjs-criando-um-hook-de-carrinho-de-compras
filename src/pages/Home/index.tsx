import React, { useEffect, useState } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';
import { useCart } from '../../hooks/useCart';
import { api } from '../../services/api';
import { Product } from '../../types';
import { formatPrice } from '../../util/format';
import { ProductList } from './styles';

type ProductFormatted = Product & {
  priceFormatted: string;
};

type CartItemsAmount = Record<number, number>;

export default function Home() {
  const [products, setProducts] = useState<readonly ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();
  const cartItemsAmount = cart.reduce<CartItemsAmount>(
    (accumulator, product) => ({
      ...accumulator,
      [product.id]: product.amount,
    }),
    {}
  );

  useEffect(() => {
    async function loadProducts() {
      const { data } = await api.get<readonly Product[]>('products');
      const products = data.map(product => ({
        ...product,
        priceFormatted: formatPrice(product.price),
      }));
      setProducts(products);
    }

    loadProducts();
  }, []);

  async function handleAddProduct(id: number) {
    await addProduct(id);
  }

  return (
    <ProductList>
      {products.map(({ id, image, priceFormatted, title }) => (
        <li key={id}>
          <img src={image} alt={title} />
          <strong>{title}</strong>
          <span>{priceFormatted}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[id] ?? 0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
}
