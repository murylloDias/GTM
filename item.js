function () {
  const data = JSON.parse(/*{{DL}}*/)
  const ecommerce = {
    currency: 'BRL',
    items: [{
      item_id: data._id,
      item_name: data.printDescription,
      coupon: '',
      discount: data.price.discount,
      affiliation: data.store.id,
      item_brand: data.brand,
      item_category: data.group,
      item_variant: data.details,
      price: data.price.originalPrice,
      currency: 'BRL',
      index: data.order,
      quantity: 1
    }],
    value: data.price.actualPrice
  }

  if ((VIEW.length === 0) || (ecommerce.items[0].item_id !== VIEW[VIEW.length - 1].items[0].item_id)) {
    VIEW.push(ecommerce)
  }

  return ecommerce
}
