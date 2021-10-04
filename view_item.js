function () {
  const data = JSON.parse(/*{{DL}}*/)
  const ecommerce = {
    currency: 'BRL',
    items: [{
      item_id: data._id,
      item_name: data.printDescription,
      coupon: 'N/D',
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
  return ecommerce
}
