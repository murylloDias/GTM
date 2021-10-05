function () {
  const index = VIEW.length - 1
  const ecommerce = {
    currency: VIEW[index].currency,
    items: VIEW[index].items,
    value: VIEW[index].value
  }
  if ((CART.length === 0) || (ecommerce.items[0].item_id !== CART[CART.length - 1].items[0].item_id)) {
    (CART.length === 0)
  }
  return ecommerce
}
