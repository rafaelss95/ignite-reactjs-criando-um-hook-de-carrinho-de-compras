import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

type CartProviderProps = Readonly<{
  children: ReactNode;
}>;

type UpdateProductAmount = Readonly<{
  productId: number;
  amount: number;
  errorMessage?: string;
}>;

type CartContextData = Readonly<{
  cart: readonly Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: (updateProductAmount: UpdateProductAmount) => void;
}>;

const CartContext = createContext<CartContextData>({} as CartContextData);
const localStorageCartKey = '@RocketShoes:cart';

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<readonly Product[]>(() => {
    const storagedCart = window.localStorage.getItem(localStorageCartKey);

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  async function addProduct(productId: number) {
    const productInCart = cart.find(({ id }) => id === productId);
    await updateProductAmount({
      productId,
      amount: (productInCart?.amount ?? 0) + 1,
      errorMessage: 'Erro na adição do produto',
    });
  }

  function removeProduct(productId: number) {
    const updatedCart = cart.filter(({ id }) => id !== productId);

    if (cart.length === updatedCart.length) {
      toast.error('Erro na remoção do produto');
    } else {
      updateCart(updatedCart);
    }
  }

  const updateProductAmount = async ({
    productId,
    amount,
    errorMessage,
  }: UpdateProductAmount) => {
    if (amount <= 0) return;

    try {
      const { data: productInStock } = await api.get<Stock>(
        `stock/${productId}`
      );

      if (amount > productInStock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const productInCart = cart.find(({ id }) => id === productId);
      const productToAdd =
        productInCart ?? (await api.get<Product>(`products/${productId}`)).data;
      const updatedCart = (
        productInCart ? cart : cart.concat(productToAdd)
      ).map(product =>
        product.id === productId ? { ...productToAdd, amount } : product
      );
      updateCart(updatedCart);
    } catch {
      toast.error(errorMessage ?? 'Erro na alteração de quantidade do produto');
    }
  };

  function updateCart(cart: readonly Product[]) {
    window.localStorage.setItem(localStorageCartKey, JSON.stringify(cart));
    setCart(cart);
  }

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  return useContext(CartContext);
}
