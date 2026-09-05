const HINDI_MONTHS = [
  'जनवरी',
  'फ़रवरी',
  'मार्च',
  'अप्रैल',
  'मई',
  'जून',
  'जुलाई',
  'अगस्त',
  'सितंबर',
  'अक्टूबर',
  'नवंबर',
  'दिसंबर',
]

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Date-only display for expense day, e.g. 05 Sep 2026 */
export function formatDay(isoOrDate) {
  if (!isoOrDate) return '—'
  const value = /^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)
    ? `${isoOrDate}T00:00:00`
    : isoOrDate
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function todayInputValue() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** e.g. 04 सितंबर 2026, शाम 05:50 बजे */
export function formatDateHindi(iso) {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = HINDI_MONTHS[d.getMonth()]
  const year = d.getFullYear()
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const period = hours < 12 ? 'सुबह' : hours < 17 ? 'दोपहर' : 'शाम'
  hours = hours % 12 || 12
  const hourStr = String(hours).padStart(2, '0')
  return `${day} ${month} ${year}, ${period} ${hourStr}:${minutes} बजे`
}

export function buildReceiptMessage(donation) {
  return [
    `🙏 गोकुल धारा सोसायटी 🙏`,
    ``,
    `हमें आपको एवं आपके परिवार को गोकुल धारा सोसायटी के गणपति उत्सव समारोह का एक महत्वपूर्ण हिस्सा बनते हुए स्वागत करते हुए अत्यंत हर्ष हो रहा है। 🌺🙏`,
    ``,
    `गणपति उत्सव के लिए आपके द्वारा दिए गए उदार सहयोग के लिए हम हृदय से आभार व्यक्त करते हैं। आपका सहयोग हमें एक समुदाय के रूप में एकजुट होकर श्री गणेश जी की दिव्य उपस्थिति का भक्ति, आनंद और आपसी प्रेम के साथ उत्सव मनाने में सहायता करता है। ❤️🪔`,
    ``,
    `🧾 Details:`,
    `रसीद क्रमांक: ${donation.receiptNo}`,
    `Date: ${formatDateHindi(donation.createdAt)}`,
    `Name: ${donation.name}`,
    `wing/ Room no. : ${donation.wing} / ${donation.roomNo}`,
    `Mobile number : ${donation.phone}`,
    `Amount : ${formatINR(donation.amount)}`,
    ``,
    `🌸 आपके बहुमूल्य योगदान एवं निरंतर सहयोग के लिए हार्दिक धन्यवाद। 🌸`,
    ``,
    `हम आपको एवं आपके पूरे परिवार को 14 सितंबर से 18 सितंबर 2026 तक आयोजित हमारे गणपति उत्सव में सादर आमंत्रित करते हैं। कृपया अपने परिवार सहित पधारें और भगवान श्री गणेश जी के दर्शन कर उनका आशीर्वाद प्राप्त करें। 🐘🙏✨`,
    `आपकी उपस्थिति हमारे उत्सव को और भी आनंदमय एवं मंगलमय बनाएगी। ❤️🌺`,
    ``,
    `🙏✨ भगवान श्री गणेश जी आपके एवं आपके पूरे परिवार को सुख, शांति, उत्तम स्वास्थ्य, समृद्धि एवं सफलता का आशीर्वाद प्रदान करें। ✨🙏`,
    ``,
    `🎉 गणपति बप्पा मोरया!`,
    `🌺 मंगल मूर्ति मोरया! 🌺`,
    ``,
    `सादर,`,
    `गोकुल धारा सोसायटी`,
    `🪔 गणपति उत्सव समिति 🪔`,
  ].join('\n')
}

/** Normalize Indian mobile to digits with country code for wa.me */
export function toWhatsAppNumber(phone) {
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length === 10) return `91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return digits
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`
  return digits
}

export function openWhatsAppReceipt(donation) {
  const number = toWhatsAppNumber(donation.phone)
  const text = encodeURIComponent(buildReceiptMessage(donation))
  const url = `https://wa.me/${number}?text=${text}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
