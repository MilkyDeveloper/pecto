# Firebase Information

This document includes some tips for working with Firebase

## Firestore

Deploy rules:
```
firebase deploy --only firestore:rules
```

Start the emulator:
```
firebase emulators:start --only firestore
```

## Authentication

New domains must be explicitly allowed in the Firebase dashboard.