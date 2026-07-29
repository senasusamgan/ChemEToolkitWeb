export function Brand() {
  return (
    <a
      className="brand"
      href="#top"
      aria-label="ChemE Toolkit home"
    >
      <svg
        className="brand-logo"
        viewBox="0 0 96 96"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="brand-logo-frame"
          d="M72 17 47 3 14 22v52l33 19 26-15"
        />

        <path
          className="brand-logo-liquid"
          d="M31 49c7-4 15 4 23 0v12c0 3-2 5-5 5H36c-3 0-5-2-5-5Z"
        />

        <rect
          className="brand-logo-vessel"
          x="28"
          y="27"
          width="29"
          height="40"
          rx="7"
        />

        <path
          className="brand-logo-process"
          d="M35 27v-5h15v5"
        />

        <path
          className="brand-logo-process"
          d="M42.5 18v9"
        />

        <path
          className="brand-logo-process"
          d="M14 43h14"
        />

        <path
          className="brand-logo-process"
          d="M57 42h8"
        />

        <path
          className="brand-logo-valve"
          d="m61 37 7 5-7 5Zm14 0-7-5v10Z"
        />

        <path
          className="brand-logo-process"
          d="M75 42h9"
        />

        <path
          className="brand-logo-process"
          d="m78 35 8 7-8 7"
        />

        <path
          className="brand-logo-process"
          d="M42.5 67v10h24"
        />

        <circle
          className="brand-logo-gauge"
          cx="75"
          cy="75"
          r="9"
        />

        <path
          className="brand-logo-process"
          d="M75 75v-5m0 5 4-3"
        />

        <circle
          className="brand-logo-bubble"
          cx="38"
          cy="56"
          r="1.8"
        />

        <circle
          className="brand-logo-bubble"
          cx="47"
          cy="61"
          r="1.4"
        />
      </svg>

      <span className="brand-wordmark">
        ChemE Toolkit
      </span>
    </a>
  )
}
