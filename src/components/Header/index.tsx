import React from 'react';
import { MdShoppingBasket } from 'react-icons/md';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.svg';
import { useCart } from '../../hooks/useCart';
import { Cart, Container } from './styles';

export default function Header() {
  const { cart } = useCart();
  const cartSize = new Set(cart.map(({ id }) => id)).size;

  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>Meu carrinho</strong>
          <span data-testid="cart-size">
            {cartSize + (cartSize === 1 ? ' item' : ' itens')}
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
}
