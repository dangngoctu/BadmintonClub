// Bộ icon nét mảnh (stroke) tự vẽ — thay cho emoji, dùng currentColor để ăn theo màu chữ.

function Svg({ size = 20, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconShuttle = (p) => (
  <Svg {...p}>
    <path d="M12 4 L7.5 14.5" />
    <path d="M12 4 L16.5 14.5" />
    <path d="M12 4 L12 14.5" />
    <path d="M8.6 8 L15.4 8" />
    <circle cx="12" cy="17.2" r="2.6" />
  </Svg>
)

export const IconCourt = (p) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="15" rx="1.5" />
    <line x1="12" y1="4.5" x2="12" y2="19.5" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
  </Svg>
)

export const IconUsers = (p) => (
  <Svg {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
)

export const IconTrophy = (p) => (
  <Svg {...p}>
    <path d="M6 4h12v3a6 6 0 0 1-12 0V4z" />
    <path d="M6 5H4a2 2 0 0 0 0 4h2" />
    <path d="M18 5h2a2 2 0 0 1 0 4h-2" />
    <line x1="12" y1="13" x2="12" y2="17" />
    <path d="M9 20h6" />
    <path d="M10 17h4l-.5 3h-3z" />
  </Svg>
)

export const IconClock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15.5 14" />
  </Svg>
)

export const IconDownload = (p) => (
  <Svg {...p}>
    <path d="M21 15v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Svg>
)

export const IconUpload = (p) => (
  <Svg {...p}>
    <path d="M21 15v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
    <polyline points="7 8 12 3 17 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Svg>
)

export const IconTrash = (p) => (
  <Svg {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </Svg>
)

export const IconPlus = (p) => (
  <Svg {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
)

export const IconCheck = (p) => (
  <Svg {...p}>
    <polyline points="20 6 9 17 4 12" />
  </Svg>
)

export const IconX = (p) => (
  <Svg {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
)

export const IconPencil = (p) => (
  <Svg {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Svg>
)

export const IconLock = (p) => (
  <Svg {...p}>
    <rect x="4.5" y="11" width="15" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
)

export const IconUnlock = (p) => (
  <Svg {...p}>
    <rect x="4.5" y="11" width="15" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 7.4-2" />
  </Svg>
)

export const IconWallet = (p) => (
  <Svg {...p}>
    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
    <path d="M16 12h5v4h-5a2 2 0 0 1 0-4z" />
  </Svg>
)
