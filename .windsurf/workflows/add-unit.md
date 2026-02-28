---
auto_execution_mode: 0
description: Add a unit to a property for landlords
---

# Add Unit to Property Workflow

This workflow guides landlords through the process of adding a new unit to an existing property, ensuring data integrity and following the correct order of operations.

## Prerequisites
- User must be authenticated as a landlord
- At least one property must exist in the system
- Landlord must own the property where the unit will be added

## Step-by-Step Process

### 1. Property Selection
- Display all properties owned by the authenticated landlord
- Allow landlord to select the target property
- Verify property ownership before proceeding

### 2. Unit Information Collection
Collect the following required information:
- **Unit Code**: Unique identifier for the unit (must be unique across all units)
- **Unit Name**: Human-readable name/description (e.g., "Apartment 101", "Studio B")
- **Status**: Initial status (defaults to 'available')

### 3. Validation Rules
Before creating the unit, validate:
- Unit code uniqueness across all units in the system
- Unit name is not empty
- Selected property exists and belongs to the authenticated landlord
- Property has capacity for additional units (if applicable)

### 4. Database Operations
Execute in the following order:
1. Create the unit record with property_id association
2. Update the property's total_units count
3. Set initial unit status to 'available'

### 5. Response Handling
- Return success response with the newly created unit details
- Include updated property information
- Handle any validation errors with appropriate messages

## Technical Implementation

### Backend Flow
1. **Controller Method**: `LandlordUnitController@store`
2. **Validation**: Use Form Request for unit creation validation
3. **Database Transaction**: Ensure atomic operations
4. **Response**: Return JSON response for API or Inertia response for web

### Frontend Flow
1. **Property Selection**: Dropdown or list of landlord's properties
2. **Unit Form**: Form with unit code, name, and status fields
3. **Real-time Validation**: Check unit code uniqueness as user types
4. **Success Handling**: Redirect to property details or units list

### API Endpoints
```
GET /landlord/properties - List landlord's properties
POST /landlord/units - Create new unit
GET /landlord/units/{unit} - Show unit details
PUT /landlord/units/{unit} - Update unit
```

### Web Routes
```
GET /landlord/units/create - Show unit creation form
POST /landlord/units - Store new unit
GET /landlord/properties/{property}/units - List property units
```

## Database Schema Considerations

### Units Table Structure
- `id` (Primary Key)
- `property_id` (Foreign Key to properties table)
- `unit_code` (Unique string)
- `unit_name` (String)
- `status` (Enum: 'available', 'occupied')
- `created_at`, `updated_at` (Timestamps)

### Relationships
- Unit belongs to Property
- Property has many Units
- Unit has many Tenancies (through tenancies table)

## Error Handling

### Common Scenarios
1. **Duplicate Unit Code**: Return validation error
2. **Property Not Found**: 404 error
3. **Unauthorized Access**: 403 error
4. **Database Constraint Violation**: 500 error with logging

### Validation Messages
- "Unit code must be unique across all properties"
- "Unit name is required"
- "Selected property does not exist or you don't have permission"

## Testing Requirements

### Unit Tests
- Test unit creation with valid data
- Test validation failures
- Test property ownership verification
- Test database transaction rollback on errors

### Feature Tests
- Test complete workflow from property selection to unit creation
- Test unauthorized access attempts
- Test concurrent unit creation scenarios

## Security Considerations

1. **Authorization**: Ensure only property owners can add units
2. **Input Validation**: Sanitize all user inputs
3. **Rate Limiting**: Prevent abuse of unit creation endpoint
4. **Audit Logging**: Log unit creation activities

## Performance Optimization

1. **Database Indexing**: Ensure unit_code has unique index
2. **Caching**: Cache property lists for frequently accessed data
3. **Lazy Loading**: Use eager loading for related data when needed

## Follow-up Actions

After successful unit creation:
1. Redirect to property units list
2. Show success notification
3. Update property statistics
4. Log the creation event for audit purposes
