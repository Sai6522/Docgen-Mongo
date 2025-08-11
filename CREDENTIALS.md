# DocGen-Mongo User Credentials

## Updated Test Credentials

### Admin User
- **Email**: admin@docgen.com
- **Password**: admin123
- **Role**: admin
- **Access**: Full access to all features including user management

### HR User
- **Email**: hr@docgen.com
- **Password**: hr123456
- **Role**: hr
- **Access**: Templates, Documents, Audit Logs, Bulk Generation (no user management)

### Staff User
- **Email**: staff@docgen.com
- **Password**: staff123456
- **Role**: staff
- **Access**: Templates, Documents, Document Generation (no audit logs or user management)

## Role-Based Access Control

### Admin Role
- ✅ Dashboard
- ✅ Templates (Create, Edit, Delete)
- ✅ Documents (Generate, Download, Preview, Email)
- ✅ Bulk Generation
- ✅ Audit Logs
- ✅ User Management
- ✅ All API endpoints

### HR Role
- ✅ Dashboard
- ✅ Templates (Create, Edit, Delete)
- ✅ Documents (Generate, Download, Preview, Email)
- ✅ Bulk Generation
- ✅ Audit Logs
- ❌ User Management (Access Denied)

### Staff Role
- ✅ Dashboard
- ✅ Templates (View, Use)
- ✅ Documents (Generate, Download, Preview, Email)
- ❌ Bulk Generation (Not visible in menu)
- ❌ Audit Logs (Access Denied)
- ❌ User Management (Not visible in menu)

## Notification System

All user roles have access to:
- ✅ System notifications
- ✅ Welcome messages
- ✅ Success/Error toasts
- ✅ No red error notifications on page load

## API Endpoints Access

### Public Endpoints
- `POST /api/auth/login` - All users

### Authenticated Endpoints (All Roles)
- `GET /api/templates` - All authenticated users
- `GET /api/documents` - All authenticated users
- `GET /api/notifications` - All authenticated users
- `GET /api/dashboard/stats` - All authenticated users

### Role-Restricted Endpoints
- `GET /api/audit` - Admin and HR only
- `GET /api/users` - Admin only
- `POST /api/users` - Admin only
- `PUT /api/users/:id` - Admin only
- `DELETE /api/users/:id` - Admin only

## Testing Instructions

1. **Login as Admin**: Full access to test all features
2. **Login as HR**: Test templates, documents, audit logs (should not see user management)
3. **Login as Staff**: Test templates, documents (should not see audit logs or user management)

All users should experience:
- ✅ Smooth login process
- ✅ No red error notifications on dashboard load
- ✅ Appropriate menu items based on role
- ✅ Proper access control messages when accessing restricted areas
