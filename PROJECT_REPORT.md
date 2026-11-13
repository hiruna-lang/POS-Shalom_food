# Shalom Food POS - Project Report

## 1. Project Summary

Shalom Food POS is a browser-based restaurant point-of-sale system built for cashier, kitchen, order, menu, reporting, staff, and system-management workflows.

The application is currently a front-end POS prototype. It starts with sample data and keeps changes in React application state while the page is running. The project does not currently show a separate backend API or database service.

The current dashboard has been customized for the client:

- The **Dining Tables** dashboard button was removed.
- Table selection was removed from the POS cart.
- The **Inventory / Stock** dashboard button was removed.
- The Inventory page source is retained for compatibility, but its route and navigation entry are removed from the active application.
- The **Dine-in** order type remains available, but orders no longer require a table selection in the visible POS interface.

## 2. Languages and Technologies

### Programming Languages

- **TypeScript**: Main application language for React components, state management, data types, and business logic.
- **JavaScript**: Build and styling configuration files such as `postcss.config.js` and `tailwind.config.js`.
- **HTML**: Main document structure in `index.html`.
- **CSS**: Global styling in `src/index.css`.

### Frameworks and Tools

- **React 18**: User-interface component framework.
- **Vite**: Development server and production build tool.
- **Tailwind CSS**: Utility classes used for layout, colors, spacing, responsive design, and component styling.
- **React Router**: Page navigation and URL routing.
- **Lucide React**: Icons used throughout the interface.
- **PostCSS and Autoprefixer**: CSS processing.
- **TypeScript compiler**: Type checking and project compilation.

## 3. Application Structure

### Main source folders

- `src/components/`: Reusable interface components.
- `src/components/common/`: Shared dialogs, modals, and toast notifications.
- `src/components/layout/`: Header and navigation components.
- `src/components/pos/`: Cart, food cards, payment, receipt, KOT, and table-related components.
- `src/context/`: Shared POS state and business operations.
- `src/data/`: Initial demo data for menu items, orders, users, settings, and inventory.
- `src/pages/`: Main application screens.
- `src/types/`: TypeScript data models.
- `src/utils/`: Helper functions such as sound effects.

## 4. Main Interfaces and Screens

### 4.1 Dashboard

The home screen provides large quick-access buttons:

1. **POS / Billing**
   - Opens the cashier billing screen.
   - Supports dine-in and takeaway order types.

2. **Menu Management**
   - Opens menu item and category management.
   - Used for dishes, prices, categories, availability, and hidden items.

3. **Orders & Kitchen**
   - Opens the kitchen order queue.
   - Shows pending and in-kitchen orders.

4. **Reports & Sales**
   - Opens sales and reporting tools.
   - Shows revenue, trends, and report information.

5. **Staff & Cashiers**
   - Opens staff/user management.
   - Used for roles, accounts, and PIN-related user data.

6. **System Settings**
   - Opens restaurant, printer, cash drawer, and kitchen routing settings.

7. **Lock / Logout**
   - Opens the logout/lock confirmation flow.
   - Allows switching user or ending the current session.

Other dashboard controls:

- **Return**: Opens the return/refund settlement dialog.
- **Information button (`i`)**: Opens software and hardware information.
- **Live clock**: Displays current date and time.
- **User indicator**: Shows the active user and role.

### 4.2 POS / Billing

The POS screen is divided into two main areas.

#### Menu area

- Search menu items by name or description.
- Filter by category.
- Large touchscreen-friendly menu food cards with simple names, prices, and add buttons.
- Advanced dietary fields remain available in menu management but are not shown as cashier filters.
- Add food items to the cart.
- Show item availability.

#### Cart and checkout area

Order-type buttons:

- **Dine-in**
- **Takeaway**

Takeaway controls:

- Customer name.
- Phone number.

Cart controls:

- Increase item quantity.
- Decrease item quantity.
- Remove an item.
- Add or edit item notes.
- Add order notes.
- Apply percentage or fixed discounts.
- Clear cart.
- Hold current order.
- Recall a held order.
- Delete a held order.

Checkout buttons:

- **Send to Kitchen / KOT**: Creates an order and sends kitchen items to the kitchen display.
- **Pay Now**: Opens the payment dialog.
- **Cash payment**: Records cash received and calculates change.
- **Card payment**: Records a card payment.
- **Other supported payment methods**: Based on the payment options in the payment dialog.
- **Print Receipt**: Opens the receipt view and print flow after payment.

Automatic calculations:

- Subtotal.
- Discount amount.
- Tax.
- Service charge for dine-in orders.
- Final grand total.
- Change due for cash payments.

### 4.3 Orders and Kitchen Queue

The Orders screen has two view modes:

- **Table View**: Lists and filters all orders.
- **Kitchen Display (KDS)**: Shows active kitchen orders for preparation.

Order controls include:

- Search by order number, customer, or table information stored on an order.
- Filter by order status.
- Filter by order type.
- View order details.
- Print receipt.
- View kitchen order ticket.
- Update order status.
- Mark orders as ready or completed.
- Cancel an order.
- Update payment status.

Order statuses include:

- Pending.
- In Kitchen.
- Ready for Service.
- Completed.
- Cancelled.

### 4.4 Menu Management

The Menu screen manages food categories and menu items.

Typical controls include:

- Add category.
- Edit category.
- Delete category.
- Add menu item.
- Edit menu item.
- Delete menu item.
- Hide or show a menu item.
- Enable or disable item availability.
- Configure price, category, description, kitchen destination, and dietary flags.

### 4.5 Reports and Sales

The Reports screen provides reporting views for sales and operational information.

It includes:

- Today, yesterday, week, month, year, and custom date ranges.
- Revenue from paid, non-cancelled orders.
- Customer bill count and paid order count.
- Cash, card, and LankaQR totals.
- Total discounts and cancelled-order loss.
- Best-selling products derived from order lines.
- Category sales derived from order lines.
- Hourly sales derived from order timestamps.
- CSV export and print-to-PDF workflow.

The dashboard also displays a calculated revenue value on the Reports & Sales tile.

### 4.6 Settings

Settings are organized into tabs:

1. **General & Restaurant Info**
   - Restaurant name.
   - Branch name.
   - Currency and general settings.

2. **User & Staff Accounts**
   - Add users.
   - Edit users.
   - Delete users.
   - Assign roles.
   - Configure PIN and account information.

3. **Printers**
   - Customer bill printer.
   - Kitchen 1 printer.
   - Kitchen 2 printer.
   - Test printer actions.

4. **Cash Drawer**
   - Configure cash drawer settings.
   - Test the cash drawer.

5. **Kitchen Routing**
   - Assign menu categories to Kitchen 1 or Kitchen 2.

Backup and cloud synchronization controls are intentionally hidden because those services are not implemented in this frontend phase.

## 5. End-to-End System Workflow

### Creating a sale

1. Open **POS / Billing** from the dashboard.
2. Search or browse the menu.
3. Add food items to the cart.
4. Change quantities or add item notes.
5. Select **Dine-in** or **Takeaway**.
6. Enter customer and delivery information when required.
7. Apply a discount if needed.
8. Review subtotal, tax, service charge, and grand total.
9. Either:
   - Send the order to the kitchen using KOT, or
   - Select **Pay Now** to complete payment.
10. Select the payment method.
11. Confirm the payment.
12. Review or print the receipt.
13. If KOT was sent first, use **Pay Pending Order** to pay the existing order without creating a duplicate.
14. The order is added to the Orders screen and notifications are generated.

### Kitchen workflow

1. A cashier sends an order to the kitchen.
2. The order appears in the KDS queue and is filtered by its configured kitchen route.
3. Kitchen staff review the items, quantities, and notes.
4. Staff update the order status.
5. The order progresses from pending/in-kitchen to ready and completed.

### Return/refund workflow

1. Click **Return** on the dashboard.
2. Enter the order number.
3. Click **Find Order**.
4. Review the order and payment information.
5. Enter or select a refund reason.
6. Confirm the refund action.
7. The system creates a notification for the refund.

### User workflow

1. Open the user profile menu.
2. Review the active account and role.
3. Switch between demo accounts if required.
4. Open System Settings for account management.
5. Lock or log out from the profile menu or dashboard.

## 6. State and Data Behavior

The main shared state is managed by `PosContext`.

It controls:

- Current user and users.
- Menu categories and menu items.
- Cart contents.
- Order type and customer information.
- Discounts and totals.
- Orders and order statuses.
- Held orders.
- Settings.
- Notifications.
- Live clock.

Initial values are loaded from `src/data/mockData.ts`. The current implementation is primarily client-side and in-memory. A production deployment would need persistent storage, authentication, server-side validation, printer integration, and a real database/API.

## 7. Current Client Customizations

The following items were intentionally removed from the visible client workflow:

- Dining Tables dashboard tile.
- Dashboard table modal.
- POS cart table selector.
- Table-selection instructions and change-table button.
- Inventory / Stock dashboard tile.
- Dashboard inventory navigation and low-stock badge calculation.

The underlying table-related TypeScript types and some legacy table/order fields remain in the code to preserve compatibility with existing sample order data. The Inventory page source and state helpers are retained but are not exposed through the active router or navigation.

Kitchen tickets, receipt printing, printer tests, and cash-drawer actions are frontend simulations. No physical Ethernet printer, card terminal, cash drawer, cloud service, or database connection is attempted.

## 8. Running the Project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local address shown by Vite, normally:

```text
http://127.0.0.1:5173
```

Build the project:

```bash
npm run build
```

The production build currently completes successfully.

## 9. Important Files

- `src/App.tsx`: Application routes and provider setup.
- `src/context/PosContext.tsx`: Shared POS state and order operations.
- `src/pages/DashboardPage.tsx`: Dashboard interface and quick actions.
- `src/pages/PosPage.tsx`: POS menu and cart layout.
- `src/components/pos/CartPanel.tsx`: Cart, order type, discounts, holding, KOT, and payment entry.
- `src/pages/OrdersPage.tsx`: Orders and KDS interface.
- `src/pages/MenuPage.tsx`: Menu management.
- `src/pages/ReportsPage.tsx`: Reports and sales.
- `src/pages/SettingsPage.tsx`: System configuration.
- `src/data/mockData.ts`: Initial demo data.
- `src/types/pos.ts`: Shared TypeScript types.
- `package.json`: Scripts and dependencies.

## 10. Verification Completed

- `npm run build` completed successfully after the changes.
- The Vite development server responded with HTTP status `200` at `http://127.0.0.1:5173`.
- Inventory and Dining Tables are no longer active dashboard modules or routes.
- Reports now calculate from the current demo order data.
- Clear-cart confirmation, pending KOT payment handoff, non-empty KOT previews, and simulated hardware messaging were implemented.

## 11. Future Integration Work

- Connect the frontend state to a real backend and database.
- Add real authentication and permission enforcement.
- Add actual Ethernet printer and cash-drawer adapters.
- Add real card/LankaQR payment gateway integration.
- Add durable shift closing and end-of-day settlement storage.
- Add automated unit and browser tests for billing, mixed-kitchen KOT routing, payments, and report calculations.

