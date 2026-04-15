export const fetchTablesMock = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  // All in الصالة الرئيسية for now; tabs filter to other zones when needed
  return [
    // Row 1 (right to left like Arabic reading) — 01 to 07
    { id: 'T01', tableNumber: '01', capacity: 4, shape: 'square', zone: 'الصالة الرئيسية', status: 'Available', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'T02', tableNumber: '02', capacity: 2, shape: 'circle', zone: 'الصالة الرئيسية', status: 'Occupied', isOrderingEnabled: true, activeOrdersCount: 1 },
    { id: 'T03', tableNumber: '03', capacity: 4, shape: 'square', zone: 'الصالة الرئيسية', status: 'Available', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'T04', tableNumber: '04', capacity: 4, shape: 'square', zone: 'الصالة الرئيسية', status: 'Reserved', reservationNote: 'م 8:00', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'T05', tableNumber: '05', capacity: 2, shape: 'circle', zone: 'الصالة الرئيسية', status: 'Occupied', isOrderingEnabled: true, activeOrdersCount: 1 },
    { id: 'T06', tableNumber: '06', capacity: 4, shape: 'square', zone: 'الصالة الرئيسية', status: 'Available', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'T07', tableNumber: '07', capacity: 6, shape: 'rectangle', zone: 'الصالة الرئيسية', status: 'Available', isOrderingEnabled: true, activeOrdersCount: 0 },

    // Row 2 — 08 to 13
    { id: 'T08', tableNumber: '08', capacity: 4, shape: 'square', zone: 'الصالة الرئيسية', status: 'Available', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'T09', tableNumber: '09', capacity: 4, shape: 'square', zone: 'الصالة الرئيسية', status: 'Available', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'T10', tableNumber: '10', capacity: 8, shape: 'rectangle', zone: 'الصالة الرئيسية', status: 'Reserved', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'T11', tableNumber: '11', capacity: 2, shape: 'circle', zone: 'الصالة الرئيسية', status: 'Available', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'T12', tableNumber: '12', capacity: 8, shape: 'rectangle', zone: 'الصالة الرئيسية', status: 'Occupied', reservationNote: 'د 15 - #1049', isOrderingEnabled: true, activeOrdersCount: 2 },
    { id: 'T13', tableNumber: '13', capacity: 6, shape: 'rectangle', zone: 'الصالة الرئيسية', status: 'Available', isOrderingEnabled: true, activeOrdersCount: 0 },

    // Row 3 — 14 to 19
    { id: 'T14', tableNumber: '14', capacity: 4, shape: 'square', zone: 'الصالة الرئيسية', status: 'Available', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'T15', tableNumber: '15', capacity: 2, shape: 'circle', zone: 'الصالة الرئيسية', status: 'Occupied', isOrderingEnabled: true, activeOrdersCount: 1 },
    { id: 'T16', tableNumber: '16', capacity: 6, shape: 'rectangle', zone: 'الصالة الرئيسية', status: 'Available', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'T17', tableNumber: '17', capacity: 4, shape: 'square', zone: 'الصالة الرئيسية', status: 'Available', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'T18', tableNumber: '18', capacity: 2, shape: 'circle', zone: 'الصالة الرئيسية', status: 'Occupied', isOrderingEnabled: true, activeOrdersCount: 1 },
    { id: 'T19', tableNumber: '19', capacity: 10, shape: 'rectangle', zone: 'الصالة الرئيسية', status: 'Reserved', reservationNote: 'م 8:30', isOrderingEnabled: true, activeOrdersCount: 0 },

    // VIP zone
    { id: 'V01', tableNumber: '01', capacity: 6, shape: 'rectangle', zone: 'قاعة VIP', status: 'Available', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'V02', tableNumber: '02', capacity: 4, shape: 'square', zone: 'قاعة VIP', status: 'Reserved', reservationNote: 'م 9:00', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'V03', tableNumber: '03', capacity: 8, shape: 'rectangle', zone: 'قاعة VIP', status: 'Reserved', isOrderingEnabled: true, activeOrdersCount: 0 },

    // Outdoor zone
    { id: 'O01', tableNumber: '01', capacity: 4, shape: 'square', zone: 'الخارجي', status: 'Available', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'O02', tableNumber: '02', capacity: 2, shape: 'circle', zone: 'الخارجي', status: 'Available', isOrderingEnabled: true, activeOrdersCount: 0 },
    { id: 'O03', tableNumber: '03', capacity: 6, shape: 'rectangle', zone: 'الخارجي', status: 'Occupied', isOrderingEnabled: true, activeOrdersCount: 1 },
    { id: 'O04', tableNumber: '04', capacity: 4, shape: 'square', zone: 'الخارجي', status: 'Maintenance', isOrderingEnabled: false, activeOrdersCount: 0 },
  ];
};
