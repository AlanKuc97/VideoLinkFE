# **App Name**: ConnectNow

## Core Features:

- User Registration: User registration with email, name, password, and date of birth fields.
- User Login: User login with email and password fields, securely storing tokens.
- Location Acquisition: Acquire user's geographical location (latitude and longitude) to find potential partners.
- Partner Search: Create a "search user" instance, indicating the user is looking for a chat partner. Polling mechanism that obtains search-user-id and stores to retrieve a matched partner
- Video Chat: Enables video and audio communication between users, including signaling using WebRTC, video elements to display the partner's video stream, controls for muting/unmuting.
- Error Handling: Display a message if the user's request has an error, with different ways of fixing the issue.

## Style Guidelines:

- Primary color: Indigo (#4B0082) to convey trust and connection.
- Background color: Very light indigo (#F0F8FF), a subtle backdrop.
- Accent color: Violet (#8A2BE2), for highlights and CTAs.
- Body font: 'Inter', a grotesque-style sans-serif, for a modern, machined look.
- Headline font: 'Space Grotesk', for the same techy, scientific look in prominent titles.
- Clean, intuitive layout with focus on video display. Use of cards and modals for additional information.
- Subtle transitions and animations for loading states and partner matching.