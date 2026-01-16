interface InvoiceItem {
  productId: string
  productName: string
  productPrice: number
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

interface InvoiceTableProps {
  items: InvoiceItem[]
  itemPrice: number
  shippingFee?: number
  totalPrice?: number
}

export function InvoiceTable({ items, itemPrice, shippingFee = 0, totalPrice = 0 }: InvoiceTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="w-full">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Item</th>
            <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Unit Price</th>
            <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">Qty</th>
            <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="border border-gray-300 px-4 py-2 text-sm">
                <div className="font-medium text-gray-900">{item.productName}</div>
                {(item.selectedSize || item.selectedColor) && (
                  <div className="text-xs text-gray-600">
                    {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                    {item.selectedSize && item.selectedColor && <span> • </span>}
                    {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                  </div>
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-700">
                ₦{formatCurrency(item.productPrice)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-700">{item.quantity}</td>
              <td className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">
                ₦{formatCurrency(item.productPrice * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-64">
          <div className="flex justify-between items-center py-2 border-b border-gray-300">
            <span className="text-sm text-gray-700">Subtotal:</span>
            <span className="text-sm font-medium text-gray-900">₦{formatCurrency(itemPrice)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-300">
            <span className="text-sm text-gray-700">Shipping Fee:</span>
            <span className="text-sm font-medium text-gray-900">₦{formatCurrency(shippingFee)}</span>
          </div>
          <div className="flex justify-between items-center py-3 bg-gray-100 px-3 rounded">
            <span className="font-semibold text-gray-900">Grand Total:</span>
            <span className="text-lg font-bold text-gray-900">₦{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
