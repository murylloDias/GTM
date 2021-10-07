function () {
  const data = JSON.parse(/*{{DL}}*/)
  const items = data.products.map(function (item) {
    const product = {
      item_id: item.id,
      item_name: item.name,
      coupon: '' || 'N/D',
      affiliation: data.store.name,
      item_brand: 'Accon',
      price: item.total,
      currency: 'BRL',
      quantity: item.quantity
    }
    return product
  })
  return items
}
