# Data Model: Layout Enhancement & Social Integration

## Key Entities

### ShareableContent

Represents content that can be shared (race result, race detail).

- **URL**: `string` - The URL of the content to be shared.
- **title**: `string` - The title of the content.
- **description**: `string` - A short description of the content.
- **image**: `string` (optional) - The URL of an image to be used in the share preview.

### ServiceStatus

Represents the health status of an external service.

- **name**: `string` - The name of the service (e.g., "KRA API").
- **status**: `enum` ("operational", "degraded", "outage") - The current status of the service.
- **lastChecked**: `ISO string` - The timestamp of the last status check.
- **message**: `string` (optional) - An optional message with more details about the status.

### SocialLink

Represents a social media link.

- **platform**: `string` - The name of the social media platform (e.g., "Telegram").
- **url**: `string` - The URL of the social media page.
- **icon**: `string` - The name of the icon to be used for the link.