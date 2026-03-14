'use client'

import { QRCodeSVG } from 'qrcode.react'

export default function CertificateQR({ url }: { url: string }) {
  return <QRCodeSVG value={url} size={100} />
}
