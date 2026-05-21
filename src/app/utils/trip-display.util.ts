export function formatTripAddress(addr: any): string {
  if (!addr) {
    return 'Address not available';
  }
  if (addr.fullAddress) {
    return addr.fullAddress;
  }
  const parts = [addr.street, addr.city, addr.state, addr.country, addr.postalCode]
    .filter((part) => !!part);
  return parts.length ? parts.join(', ') : 'Address not available';
}

export function hasDisplayValue(value: any): boolean {
  if (value == null || value === '') {
    return false;
  }
  if (Array.isArray(value)) {
    return value.some((item) => item != null && item !== '');
  }
  if (typeof value === 'number') {
    return true;
  }
  const text = String(value).trim();
  return text !== '' && text !== '-';
}

export function formatPaymentMode(raw: any): string {
  if (raw == null || raw === '') {
    return '-';
  }
  const v = String(raw).trim().toLowerCase();
  const map: Record<string, string> = {
    cop: 'Cash on Pickup',
    cod: 'Cash on Delivery',
    'cash on pickup': 'Cash on Pickup',
    'cash on delivery': 'Cash on Delivery',
    credit: 'Credit',
    online: 'Online',
  };
  return map[v] ?? String(raw);
}

export function paymentModeLabel(order: any): string {
  if (!order) {
    return '-';
  }
  const raw = order.paymentMode ?? order.paymentDetails?.paymentMode ?? '';
  return formatPaymentMode(raw);
}

export function paymentStatusLabel(order: any): string {
  if (!order) {
    return '-';
  }
  const raw = order.paymentStatus ?? order.paymentDetails?.paymentStatus ?? '';
  if (!raw) {
    return '-';
  }
  const v = String(raw).toLowerCase();
  if (v === 'success' || v === 'paid') {
    return 'Paid';
  }
  if (v === 'pending') {
    return 'Pending';
  }
  if (v === 'failed') {
    return 'Failed';
  }
  return String(raw);
}

export function orderStatusLabel(status: any): string {
  if (!status) {
    return '-';
  }
  const key = String(status).toLowerCase().replace(/\s/g, '');
  const map: Record<string, string> = {
    new: 'New',
    orderassigned: 'Assigned',
    orderinprogress: 'In Progress',
    orderpickeduped: 'Picked Up',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return map[key] ?? String(status);
}

export function formatListField(value: any): string {
  if (value == null || value === '') {
    return '-';
  }
  if (Array.isArray(value)) {
    const items = value.filter((item) => item != null && item !== '');
    return items.length ? items.join(', ') : '-';
  }
  return String(value);
}

export function courierName(order: any): string {
  return (
    order?.deliveryManDetails?.name ??
    order?.assigneeDetails?.name ??
    'Not Assigned'
  );
}

export function hasContactPerson(addr: any): boolean {
  return !!(addr?.contactPerson || addr?.contactPersonNumber);
}

export function statusTimestamp(order: any): string | Date | null {
  if (!order?.orderStatus) {
    return order?.createdAt ?? null;
  }
  const status = String(order.orderStatus).toLowerCase();
  switch (status) {
    case 'new':
      return order.newAt ?? order.createdAt ?? null;
    case 'orderassigned':
      return order.assignedAt ?? order.createdAt ?? null;
    case 'orderinprogress':
      return order.inProgressAt ?? order.createdAt ?? null;
    case 'orderpickeduped':
      return order.pickUpedAt ?? order.createdAt ?? null;
    case 'delivered':
      return order.deliveredAt ?? order.createdAt ?? null;
    case 'cancelled':
      return order.cancelledAt ?? order.createdAt ?? null;
    default:
      return order.updatedAt ?? order.createdAt ?? null;
  }
}
