interface PaymentStatusProps {
  settledByPaystack: boolean
}

export function PaymentStatus({ settledByPaystack }: PaymentStatusProps) {
  const status = settledByPaystack ? "PAID" : "UNPAID"
  const statusColor = settledByPaystack ? "text-green-500" : "text-red-500"

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <div
        className={`text-9xl font-bold opacity-20 ${statusColor} transform -rotate-45`}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-45deg)",
          whiteSpace: "nowrap",
          zIndex: 10,
        }}
      >
        {status}
      </div>
    </div>
  )
}
