"use client";

import {useLocale} from "next-intl";
import {
    Database,
    Eye,
    FileText,
    Globe2,
    Lock,
    Mail,
    Shield,
    UserCheck,
} from "lucide-react";

type Section = {
    id: string;
    title: string;
    paragraphs?: string[];
    bullets?: string[];
};

const content = {
    en: {
        badge: "PRIVACY POLICY",
        title: "WrapLink Privacy Policy",
        description:
            "This Privacy Policy explains what personal information WrapLink may collect, why it is processed, how it is protected, and what rights may be available to you.",
        effective: "Effective date: September 26, 2026",
        version: "Privacy Policy version: 2026-09-26",

        sections: [
            {
                id: "controller",
                title: "1. Who is responsible for your data?",
                paragraphs: [
                    "The entity operating the WrapLink service is responsible for determining how personal data is processed.",
                    "Before production publication, this section must identify the actual legal entity operating WrapLink, its registered address and the appropriate privacy contact.",
                ],
                bullets: [
                    "Legal entity: WrapLink is currently operated by the project owner as an individual software project.",
                    "Registered address: Not applicable while WrapLink is operated as a personal project.",
                    "Privacy contact: mahdi.asgari@gmail.com",
                    "Data Protection Officer: No Data Protection Officer is currently appointed. If appointment becomes legally required, the relevant contact details will be published here.",
                ],
            },
            {
                id: "data",
                title: "2. Information we may collect",
                paragraphs: [
                    "The information processed depends on which WrapLink features you use.",
                ],
                bullets: [
                    "Account information such as name, email address and account identifiers.",
                    "Authentication and security information necessary to protect the account.",
                    "Connection information such as IP address, connection status, network information and service telemetry.",
                    "Bandwidth and usage information necessary to operate and report on network services.",
                    "Wallet, order and payment information necessary to process purchases and maintain transaction records.",
                    "Support information contained in support tickets and communications with WrapLink.",
                    "Device, browser and technical information necessary for security, diagnostics and service operation.",
                    "Information you voluntarily provide to WrapLink.",
                    "Information required to comply with applicable legal obligations.",
                ],
            },
            {
                id: "purposes",
                title: "3. Why we process personal data",
                paragraphs: [
                    "We process personal information only for purposes connected with operating, securing and improving the WrapLink service or complying with applicable obligations.",
                ],
                bullets: [
                    "Create and manage user accounts.",
                    "Authenticate users and protect accounts.",
                    "Provide connectivity and network services.",
                    "Monitor bandwidth and service usage.",
                    "Process wallet transactions, purchases and orders.",
                    "Detect payment abuse, fraud and unauthorized activity.",
                    "Provide customer and technical support.",
                    "Diagnose service problems and improve reliability.",
                    "Communicate about account, security, payment and service matters.",
                    "Meet legal, regulatory, accounting and security obligations.",
                ],
            },
            {
                id: "legal-basis",
                title: "4. Legal bases for processing",
                paragraphs: [
                    "Where applicable data-protection law requires a legal basis, processing may rely on one or more of the following bases depending on the purpose and circumstances.",
                ],
                bullets: [
                    "Performance of a contract or steps requested before entering into a contract.",
                    "Compliance with a legal obligation.",
                    "Legitimate interests, where those interests are not overridden by applicable rights and freedoms.",
                    "Consent, where consent is required or appropriate.",
                ],
            },
            {
                id: "account",
                title: "5. Account and authentication data",
                paragraphs: [
                    "When you create an account, WrapLink processes information necessary to establish and maintain the account.",
                    "Passwords should be stored by the backend using an appropriate one-way password hashing mechanism. WrapLink should never require or store a user's plaintext password in ordinary application records.",
                ],
                bullets: [
                    "Name and email address may be used to identify the account.",
                    "Email verification information may be generated to verify ownership of an email address.",
                    "Authentication and security events may be recorded to protect the account.",
                    "Login and session information may be processed for security and account management.",
                ],
            },
            {
                id: "network",
                title: "6. Network, connection and IP information",
                paragraphs: [
                    "WrapLink may process technical network information necessary to provide and secure connectivity services.",
                ],
                bullets: [
                    "IP addresses.",
                    "Connection state and connection timestamps.",
                    "Network and routing information.",
                    "Latency, packet-loss and diagnostic measurements.",
                    "Bandwidth consumption and usage statistics.",
                    "Security-related network events.",
                ],
                paragraphs2: [
                    "Network information may be used to provide the service, diagnose problems, detect abuse and maintain security.",
                ],
            },
            {
                id: "payments",
                title: "7. Wallet, payments and transactions",
                paragraphs: [
                    "When you add funds to a WrapLink Wallet, purchase a plan, place an order or request a refund, transaction information may be processed.",
                ],
                bullets: [
                    "Order and transaction identifiers.",
                    "Amount and currency.",
                    "Payment method.",
                    "Payment status.",
                    "Wallet balance and wallet transaction history.",
                    "Payment verification information.",
                    "Refund and cancellation information.",
                    "Cryptocurrency transaction identifiers where cryptocurrency payment is supported.",
                ],
                paragraphs2: [
                    "Where a third-party payment provider is used, payment-card or financial information may be processed directly by that provider according to its privacy policy and applicable contractual arrangements. WrapLink should not store sensitive payment credentials unless specifically required and lawfully permitted.",
                ],
            },
            {
                id: "crypto",
                title: "8. Cryptocurrency information",
                paragraphs: [
                    "If cryptocurrency payments are supported, WrapLink may process blockchain transaction information required to identify and verify a payment.",
                ],
                bullets: [
                    "Transaction hash.",
                    "Wallet address involved in the payment.",
                    "Blockchain network.",
                    "Asset/token.",
                    "Amount.",
                    "Confirmation status and timestamps.",
                ],
                paragraphs2: [
                    "Blockchain transactions may be publicly visible and may be difficult or impossible to alter or delete. Users should therefore consider the public nature of blockchain networks before making a cryptocurrency payment.",
                ],
            },
            {
                id: "support",
                title: "9. Support communications",
                bullets: [
                    "Support tickets and their contents may be stored to investigate and resolve issues.",
                    "Support agents may access information reasonably necessary to resolve the request.",
                    "Do not send passwords, private keys, recovery codes or other unnecessary secrets through support tickets.",
                    "Support records may also be retained for security, dispute resolution and legal obligations.",
                ],
            },
            {
                id: "cookies",
                title: "10. Cookies and local storage",
                paragraphs: [
                    "WrapLink may use browser storage, cookies or similar technologies to maintain sessions, remember preferences, provide security and operate the website.",
                    "The production implementation should document each non-essential cookie or tracking technology and obtain consent where required by applicable law.",
                    "Local browser storage should not be treated as a secure location for long-lived authentication secrets.",
                ],
            },
            {
                id: "security",
                title: "11. Security",
                paragraphs: [
                    "WrapLink uses reasonable technical and organisational measures intended to protect personal information against unauthorized access, loss, misuse and alteration.",
                ],
                bullets: [
                    "Access controls and authentication.",
                    "Encryption where appropriate.",
                    "Security monitoring and logging.",
                    "Fraud and abuse detection.",
                    "Restricted administrative access.",
                    "Security reviews and incident response procedures.",
                ],
                paragraphs2: [
                    "No Internet service can guarantee absolute security. Users should protect their credentials and promptly report suspected account compromise.",
                ],
            },
            {
                id: "sharing",
                title: "12. Who may receive personal data?",
                paragraphs: [
                    "Personal information may be disclosed only where reasonably necessary for the purposes described in this Policy, where required by law, or where otherwise permitted by applicable law.",
                ],
                bullets: [
                    "Infrastructure and hosting providers.",
                    "Payment and financial service providers.",
                    "Email and communication providers.",
                    "Security, monitoring and fraud-prevention providers.",
                    "Customer-support providers.",
                    "Professional advisers where necessary.",
                    "Government authorities or law-enforcement bodies where legally required.",
                ],
            },
            {
                id: "international",
                title: "13. International data transfers",
                paragraphs: [
                    "Some service providers or infrastructure used by WrapLink may process information outside your country or outside the European Economic Area.",
                    "Where applicable data-protection law requires safeguards for an international transfer, appropriate legal mechanisms should be used.",
                    "The final production policy should identify the relevant transfer mechanisms and categories of recipients.",
                ],
            },
            {
                id: "retention",
                title: "14. Data retention",
                paragraphs: [
                    "Personal information should be retained only for as long as necessary for the purpose for which it was collected, unless a longer period is required or permitted by law.",
                ],
                bullets: [
                    "Account information may be retained while the account is active and for an appropriate period afterwards.",
                    "Transaction and accounting records may need to be retained for legally required periods.",
                    "Security logs may be retained for a limited period appropriate to security and incident investigation.",
                    "Support records may be retained for service, dispute and legal purposes.",
                    "When information is no longer required, it should be securely deleted or anonymised where appropriate.",
                ],
            },
            {
                id: "rights",
                title: "15. Your privacy rights",
                paragraphs: [
                    "Depending on your location and applicable law, you may have rights concerning your personal information.",
                ],
                bullets: [
                    "Right to access personal information.",
                    "Right to correct inaccurate information.",
                    "Right to request deletion in applicable circumstances.",
                    "Right to restrict certain processing.",
                    "Right to object to certain processing.",
                    "Right to data portability where applicable.",
                    "Right to withdraw consent where processing is based on consent.",
                    "Right to lodge a complaint with the applicable data-protection supervisory authority.",
                ],
                paragraphs2: [
                    "Requests should be made through the official privacy contact. WrapLink may need to verify the identity of the requester before responding.",
                ],
            },
            {
                id: "marketing",
                title: "16. Marketing communications",
                paragraphs: [
                    "Marketing communications are separate from messages necessary to operate your account or provide services.",
                    "Where marketing consent is required, it must be optional and must not be required merely to create an account.",
                    "You can withdraw marketing consent through the available unsubscribe or account-preference mechanism.",
                ],
            },
            {
                id: "children",
                title: "17. Children",
                paragraphs: [
                    "WrapLink is not intended to knowingly collect personal information from children where doing so would violate applicable law.",
                    "If you believe that a child has provided personal information improperly, contact WrapLink through the official privacy channel.",
                ],
            },
            {
                id: "automated",
                title: "18. Automated security and fraud decisions",
                paragraphs: [
                    "WrapLink may use automated technical controls to identify suspicious login activity, payment abuse, account compromise, malicious traffic or other security risks.",
                    "Where applicable law provides rights concerning solely automated decisions that produce legal or similarly significant effects, the production implementation should provide the appropriate safeguards and review mechanisms.",
                ],
            },
            {
                id: "breach",
                title: "19. Security incidents",
                paragraphs: [
                    "If WrapLink becomes aware of a personal-data security incident, it will assess the incident and take steps required by applicable law, including notification to authorities or affected individuals where legally required.",
                ],
            },
            {
                id: "changes",
                title: "20. Changes to this Privacy Policy",
                paragraphs: [
                    "WrapLink may update this Privacy Policy when its services, processing activities or legal requirements change.",
                    "Material changes should be communicated through an appropriate channel where required.",
                    "The effective date and version displayed at the beginning of the Policy identify the version applicable to the document.",
                ],
            },
            {
                id: "contact",
                title: "21. Privacy contact",
                paragraphs: [
                    "For privacy questions or requests concerning personal information, contact the official WrapLink privacy contact published on the website.",
                    "The final production version must replace the placeholders in this document with the actual legal entity and privacy contact information.",
                ],
            },
        ] as (Section & {
            paragraphs2?: string[];
        })[],
    },

    fa: {
        badge: "سیاست حریم خصوصی",
        title: "سیاست حریم خصوصی WrapLink",
        description:
            "این سیاست توضیح می‌دهد WrapLink چه اطلاعات شخصی را ممکن است دریافت کند، چرا آن‌ها را پردازش می‌کند، چگونه از آن‌ها محافظت می‌شود و چه حقوقی ممکن است برای شما وجود داشته باشد.",
        effective: "تاریخ اجرا: ۲۶ سپتامبر ۲۰۲۶",
        version: "نسخه سیاست حریم خصوصی: 2026-09-26",

        sections: [
            {
                id: "controller",
                title: "۱. مسئول پردازش اطلاعات چه کسی است؟",
                paragraphs: [
                    "شخصیت حقوقی بهره‌بردار سرویس WrapLink مسئول تعیین نحوه پردازش اطلاعات شخصی است.",
                    "پیش از انتشار نسخه تولید، این بخش باید نام واقعی شخصیت حقوقی، نشانی ثبت‌شده و اطلاعات تماس حریم خصوصی را مشخص کند.",
                ],
                bullets: [
                    "نهاد حقوقی: WrapLink در حال حاضر توسط مالک پروژه به‌عنوان یک پروژه نرم‌افزاری شخصی اداره می‌شود و از طریق یک شرکت ثبت‌شده فعالیت نمی‌کند.",
                    "نشانی ثبت‌شده: تا زمانی که WrapLink به‌عنوان یک پروژه شخصی اداره می‌شود، نشانی ثبت‌شده تجاری قابل اعمال نیست.",
                    "تماس حریم خصوصی: mahdi.asgari@gmail.com",
                    "مسئول حفاظت از داده‌ها: در حال حاضر مسئول حفاظت از داده‌ها (DPO) منصوب نشده است. در صورت ایجاد الزام قانونی برای انتصاب DPO، مشخصات تماس وی در این صفحه منتشر خواهد شد.",
                ],
            },
            {
                id: "data",
                title: "۲. چه اطلاعاتی ممکن است جمع‌آوری شود؟",
                paragraphs: [
                    "نوع اطلاعات پردازش‌شده به امکاناتی که از WrapLink استفاده می‌کنید بستگی دارد.",
                ],
                bullets: [
                    "اطلاعات حساب مانند نام، ایمیل و شناسه حساب.",
                    "اطلاعات احراز هویت و امنیتی لازم برای حفاظت از حساب.",
                    "اطلاعات اتصال مانند IP، وضعیت اتصال و اطلاعات شبکه.",
                    "اطلاعات مصرف و پهنای باند.",
                    "اطلاعات کیف پول، سفارش و پرداخت.",
                    "محتوای تیکت‌های پشتیبانی و ارتباطات با WrapLink.",
                    "اطلاعات فنی دستگاه و مرورگر برای امنیت و عیب‌یابی.",
                    "اطلاعاتی که کاربر داوطلبانه ارائه می‌کند.",
                    "اطلاعات لازم برای رعایت الزامات قانونی.",
                ],
            },
            {
                id: "purposes",
                title: "۳. چرا اطلاعات شخصی پردازش می‌شود؟",
                paragraphs: [
                    "اطلاعات شخصی برای اهداف مرتبط با ارائه، امنیت و بهبود WrapLink یا رعایت الزامات قانونی پردازش می‌شود.",
                ],
                bullets: [
                    "ایجاد و مدیریت حساب.",
                    "احراز هویت و حفاظت از حساب.",
                    "ارائه خدمات اتصال و شبکه.",
                    "پایش مصرف و پهنای باند.",
                    "پردازش کیف پول، خرید و سفارش.",
                    "شناسایی تقلب و سوءاستفاده پرداختی.",
                    "ارائه پشتیبانی فنی و مشتری.",
                    "عیب‌یابی و افزایش پایداری سرویس.",
                    "ارتباطات مرتبط با حساب، امنیت، پرداخت و سرویس.",
                    "رعایت الزامات قانونی، مالی و امنیتی.",
                ],
            },
            {
                id: "legal-basis",
                title: "۴. مبنای قانونی پردازش",
                paragraphs: [
                    "در مواردی که قوانین حفاظت از داده نیازمند مبنای قانونی باشند، بسته به هدف پردازش ممکن است یک یا چند مبنای زیر استفاده شود.",
                ],
                bullets: [
                    "اجرای قرارداد یا اقدامات پیش از انعقاد قرارداد.",
                    "رعایت تعهد قانونی.",
                    "منافع مشروع، در مواردی که حقوق و آزادی‌های فرد بر آن غلبه نکند.",
                    "رضایت، در مواردی که قانون آن را لازم بداند یا مناسب باشد.",
                ],
            },
            {
                id: "account",
                title: "۵. اطلاعات حساب و احراز هویت",
                paragraphs: [
                    "هنگام ایجاد حساب، اطلاعات لازم برای ایجاد و مدیریت حساب پردازش می‌شود.",
                    "رمزهای عبور باید در backend با الگوریتم مناسب یک‌طرفه مانند Argon2id ذخیره شوند و نباید به صورت متن ساده نگهداری شوند.",
                ],
                bullets: [
                    "نام و ایمیل برای شناسایی حساب.",
                    "اطلاعات تأیید ایمیل.",
                    "رویدادهای امنیتی و احراز هویت.",
                    "اطلاعات ورود و session.",
                ],
            },
            {
                id: "network",
                title: "۶. اطلاعات شبکه، اتصال و IP",
                paragraphs: [
                    "WrapLink ممکن است اطلاعات فنی شبکه را برای ارائه و امنیت خدمات اتصال پردازش کند.",
                ],
                bullets: [
                    "آدرس‌های IP.",
                    "وضعیت اتصال و زمان‌های اتصال.",
                    "اطلاعات شبکه و مسیریابی.",
                    "اندازه‌گیری latency و packet loss.",
                    "مصرف پهنای باند.",
                    "رویدادهای امنیتی شبکه.",
                ],
            },
            {
                id: "payments",
                title: "۷. کیف پول، پرداخت و تراکنش",
                paragraphs: [
                    "هنگام شارژ کیف پول، خرید پلن، ایجاد سفارش یا درخواست بازپرداخت، اطلاعات تراکنش پردازش می‌شود.",
                ],
                bullets: [
                    "شناسه سفارش و تراکنش.",
                    "مبلغ و ارز.",
                    "روش پرداخت.",
                    "وضعیت پرداخت.",
                    "موجودی و تاریخچه کیف پول.",
                    "اطلاعات بررسی پرداخت.",
                    "اطلاعات لغو و بازپرداخت.",
                    "شناسه تراکنش رمزارزی در صورت پشتیبانی.",
                ],
            },
            {
                id: "crypto",
                title: "۸. اطلاعات پرداخت رمزارزی",
                paragraphs: [
                    "در صورت پشتیبانی از رمزارز، اطلاعات بلاکچین لازم برای شناسایی و تأیید پرداخت پردازش می‌شود.",
                ],
                bullets: [
                    "Transaction hash.",
                    "آدرس کیف پول مرتبط.",
                    "شبکه بلاکچین.",
                    "دارایی یا توکن.",
                    "مبلغ.",
                    "وضعیت تأیید و زمان تراکنش.",
                ],
            },
            {
                id: "support",
                title: "۹. ارتباطات پشتیبانی",
                bullets: [
                    "تیکت‌ها و محتوای آن‌ها ممکن است برای بررسی و حل مشکل ذخیره شوند.",
                    "کارکنان پشتیبانی می‌توانند به اطلاعات لازم برای حل درخواست دسترسی داشته باشند.",
                    "رمز عبور، کلید خصوصی و کدهای بازیابی را در تیکت ارسال نکنید.",
                    "سوابق پشتیبانی ممکن است برای امنیت، اختلافات و الزامات قانونی نگهداری شوند.",
                ],
            },
            {
                id: "cookies",
                title: "۱۰. کوکی و ذخیره‌سازی مرورگر",
                paragraphs: [
                    "WrapLink ممکن است از cookie، local storage یا فناوری‌های مشابه برای session، تنظیمات، امنیت و عملکرد سایت استفاده کند.",
                    "در نسخه تولید باید تمام cookieها و فناوری‌های غیرضروری مستند و در صورت الزام قانونی با رضایت کاربر فعال شوند.",
                    "ذخیره‌سازی مرورگر نباید محل امنی برای نگهداری طولانی‌مدت اطلاعات حساس احراز هویت تلقی شود.",
                ],
            },
            {
                id: "security",
                title: "۱۱. امنیت",
                paragraphs: [
                    "WrapLink از اقدامات فنی و سازمانی متعارف برای محافظت از اطلاعات در برابر دسترسی غیرمجاز، از دست رفتن، سوءاستفاده و تغییر استفاده می‌کند.",
                ],
                bullets: [
                    "کنترل دسترسی و احراز هویت.",
                    "رمزنگاری در موارد مناسب.",
                    "پایش و ثبت رویدادهای امنیتی.",
                    "تشخیص تقلب و سوءاستفاده.",
                    "محدود کردن دسترسی مدیریتی.",
                    "بررسی امنیتی و فرآیند پاسخ به رخداد.",
                ],
            },
            {
                id: "sharing",
                title: "۱۲. چه اشخاصی ممکن است اطلاعات را دریافت کنند؟",
                paragraphs: [
                    "اطلاعات شخصی تنها در حد لازم برای اهداف این سیاست، الزامات قانونی یا موارد مجاز قانونی ممکن است در اختیار اشخاص دیگر قرار گیرد.",
                ],
                bullets: [
                    "ارائه‌دهندگان زیرساخت و hosting.",
                    "ارائه‌دهندگان پرداخت و خدمات مالی.",
                    "ارائه‌دهندگان ایمیل و ارتباطات.",
                    "ارائه‌دهندگان امنیت، مانیتورینگ و تشخیص تقلب.",
                    "ارائه‌دهندگان پشتیبانی.",
                    "مشاوران حرفه‌ای در صورت نیاز.",
                    "مراجع قانونی در صورت الزام.",
                ],
            },
            {
                id: "international",
                title: "۱۳. انتقال بین‌المللی اطلاعات",
                paragraphs: [
                    "برخی سرویس‌دهندگان یا زیرساخت‌های WrapLink ممکن است اطلاعات را خارج از کشور کاربر یا خارج از منطقه اقتصادی اروپا پردازش کنند.",
                    "در مواردی که قانون حفاظت از داده برای انتقال بین‌المللی تضمین‌های خاصی لازم بداند، سازوکار قانونی مناسب باید استفاده شود.",
                ],
            },
            {
                id: "retention",
                title: "۱۴. مدت نگهداری اطلاعات",
                paragraphs: [
                    "اطلاعات شخصی فقط تا زمانی که برای هدف جمع‌آوری لازم است نگهداری می‌شود، مگر اینکه قانون مدت بیشتری را الزام یا مجاز کند.",
                ],
                bullets: [
                    "اطلاعات حساب تا زمان فعال بودن حساب و مدت مناسب پس از آن.",
                    "اطلاعات تراکنش و حسابداری طبق مدت قانونی.",
                    "لاگ‌های امنیتی برای مدت مناسب جهت امنیت و بررسی رخداد.",
                    "سوابق پشتیبانی برای اهداف سرویس، اختلاف و قانونی.",
                    "اطلاعات غیرضروری باید حذف امن یا در صورت مناسب ناشناس‌سازی شود.",
                ],
            },
            {
                id: "rights",
                title: "۱۵. حقوق شما",
                paragraphs: [
                    "بسته به محل اقامت و قانون قابل اعمال، ممکن است حقوق مختلفی نسبت به اطلاعات شخصی خود داشته باشید.",
                ],
                bullets: [
                    "دسترسی به اطلاعات شخصی.",
                    "اصلاح اطلاعات نادرست.",
                    "درخواست حذف در موارد قابل اعمال.",
                    "محدود کردن برخی پردازش‌ها.",
                    "اعتراض به برخی پردازش‌ها.",
                    "قابلیت انتقال داده در موارد قابل اعمال.",
                    "پس گرفتن رضایت در مواردی که پردازش مبتنی بر رضایت است.",
                    "ثبت شکایت نزد مرجع نظارت بر حفاظت از داده مربوطه.",
                ],
            },
            {
                id: "marketing",
                title: "۱۶. پیام‌های تبلیغاتی",
                paragraphs: [
                    "پیام‌های تبلیغاتی از پیام‌های ضروری برای عملکرد حساب و ارائه سرویس جدا هستند.",
                    "در مواردی که رضایت تبلیغاتی لازم باشد، این رضایت اختیاری است و نباید شرط ایجاد حساب باشد.",
                    "کاربر می‌تواند از طریق گزینه لغو اشتراک یا تنظیمات حساب رضایت تبلیغاتی را پس بگیرد.",
                ],
            },
            {
                id: "children",
                title: "۱۷. کودکان",
                paragraphs: [
                    "WrapLink قصد ندارد در مواردی که قانون منع می‌کند، آگاهانه اطلاعات شخصی کودکان را جمع‌آوری کند.",
                    "اگر تصور می‌کنید اطلاعات کودک به شکل نامناسب ارائه شده است، از طریق کانال رسمی حریم خصوصی تماس بگیرید.",
                ],
            },
            {
                id: "automated",
                title: "۱۸. تصمیم‌گیری خودکار امنیتی",
                paragraphs: [
                    "WrapLink ممکن است از کنترل‌های خودکار برای شناسایی ورود مشکوک، سوءاستفاده پرداختی، تصاحب حساب، ترافیک مخرب یا سایر ریسک‌های امنیتی استفاده کند.",
                    "در مواردی که قانون برای تصمیم‌های کاملاً خودکار با اثر حقوقی یا مشابه حقوقی safeguards خاصی تعیین کند، فرآیند تولید باید سازوکارهای مربوطه را فراهم کند.",
                ],
            },
            {
                id: "breach",
                title: "۱۹. رخدادهای امنیتی",
                paragraphs: [
                    "در صورت آگاهی WrapLink از رخداد امنیتی مرتبط با اطلاعات شخصی، رخداد بررسی شده و اقدامات موردنیاز قانون، از جمله اطلاع‌رسانی به مرجع یا افراد در صورت الزام، انجام خواهد شد.",
                ],
            },
            {
                id: "changes",
                title: "۲۰. تغییرات سیاست حریم خصوصی",
                paragraphs: [
                    "WrapLink می‌تواند با تغییر سرویس، نحوه پردازش یا الزامات قانونی این سیاست را به‌روزرسانی کند.",
                    "تغییرات مهم در صورت الزام قانونی از طریق مناسب اطلاع‌رسانی می‌شوند.",
                    "تاریخ اجرا و شماره نسخه ابتدای سیاست، نسخه قابل اعمال را مشخص می‌کند.",
                ],
            },
            {
                id: "contact",
                title: "۲۱. تماس حریم خصوصی",
                paragraphs: [
                    "برای پرسش یا درخواست مربوط به اطلاعات شخصی از کانال رسمی حریم خصوصی WrapLink استفاده کنید.",
                    "نسخه نهایی تولید باید اطلاعات واقعی شخصیت حقوقی و ایمیل حریم خصوصی را جایگزین موارد placeholder کند.",
                ],
            },
        ] as (Section & {
            paragraphs2?: string[];
        })[],
    },
};

export default function PrivacyPageContent() {
    const locale = useLocale();

    const isFa = locale === "fa";
    const data = isFa
        ? content.fa
        : content.en;

    return (
        <main
            dir={isFa ? "rtl" : "ltr"}
            className="min-h-screen bg-[#020509] px-4 py-16 text-white sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-7xl">

                {/* Header */}

                <div className="mb-12 max-w-4xl">

                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-semibold tracking-widest text-cyan-300">
                        <Shield className="h-4 w-4"/>
                        {data.badge}
                    </div>

                    <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                        {data.title}
                    </h1>

                    <p className="mt-5 text-lg leading-8 text-slate-300">
                        {data.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span>{data.effective}</span>
                        <span>•</span>
                        <span>{data.version}</span>
                    </div>

                </div>

                {/* Principles */}

                <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <PrivacyCard
                        icon={<Lock/>}
                        title={
                            isFa
                                ? "امنیت"
                                : "Security"
                        }
                        text={
                            isFa
                                ? "حفاظت از اطلاعات و حساب کاربری"
                                : "Protecting accounts and personal information"
                        }
                    />

                    <PrivacyCard
                        icon={<Eye/>}
                        title={
                            isFa
                                ? "شفافیت"
                                : "Transparency"
                        }
                        text={
                            isFa
                                ? "توضیح روشن درباره پردازش اطلاعات"
                                : "Clear information about data processing"
                        }
                    />

                    <PrivacyCard
                        icon={<UserCheck/>}
                        title={
                            isFa
                                ? "حقوق کاربر"
                                : "Your Rights"
                        }
                        text={
                            isFa
                                ? "دسترسی و کنترل قانونی بر اطلاعات"
                                : "Rights concerning your personal information"
                        }
                    />

                    <PrivacyCard
                        icon={<Database/>}
                        title={
                            isFa
                                ? "حداقل‌گرایی"
                                : "Data Minimisation"
                        }
                        text={
                            isFa
                                ? "پردازش اطلاعات متناسب با نیاز سرویس"
                                : "Processing information appropriate to the service"
                        }
                    />

                </div>

                {/* Contents */}

                <div className="grid gap-10 lg:grid-cols-[260px_1fr]">

                    <aside className="hidden lg:block">

                        <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/[0.025] p-4">

                            <div className="mb-4 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                                <FileText className="h-4 w-4"/>
                                {isFa
                                    ? "فهرست"
                                    : "Contents"}
                            </div>

                            <nav className="space-y-1">

                                {data.sections.map(
                                    (section) => (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            className="block rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
                                        >
                                            {section.title}
                                        </a>
                                    ),
                                )}

                            </nav>

                        </div>

                    </aside>

                    {/* Document */}

                    <div className="space-y-5">

                        {data.sections.map(
                            (section) => (
                                <section
                                    key={section.id}
                                    id={section.id}
                                    className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8"
                                >
                                    <h2 className="mb-5 text-xl font-bold">
                                        {section.title}
                                    </h2>

                                    {section.paragraphs?.map(
                                        (
                                            paragraph,
                                            index,
                                        ) => (
                                            <p
                                                key={index}
                                                className="mb-4 text-sm leading-8 text-slate-300 last:mb-0"
                                            >
                                                {
                                                    paragraph
                                                }
                                            </p>
                                        ),
                                    )}

                                    {section.bullets && (
                                        <ul className="space-y-3">
                                            {section.bullets.map(
                                                (
                                                    bullet,
                                                    index,
                                                ) => (
                                                    <li
                                                        key={
                                                            index
                                                        }
                                                        className="flex gap-3 text-sm leading-7 text-slate-300"
                                                    >
                                                        <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"/>
                                                        <span>
                                                            {
                                                                bullet
                                                            }
                                                        </span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    )}

                                    {section.paragraphs2?.map(
                                        (
                                            paragraph,
                                            index,
                                        ) => (
                                            <p
                                                key={`p2-${index}`}
                                                className="mt-5 text-sm leading-8 text-slate-400"
                                            >
                                                {
                                                    paragraph
                                                }
                                            </p>
                                        ),
                                    )}

                                </section>
                            ),
                        )}

                        {/* Contact */}

                        <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6 sm:p-8">

                            <div className="flex items-start gap-4">

                                <Mail className="mt-1 h-6 w-6 shrink-0 text-cyan-300"/>

                                <div>

                                    <h2 className="text-lg font-bold">
                                        {isFa
                                            ? "درخواست حریم خصوصی"
                                            : "Privacy requests"}
                                    </h2>

                                    <p className="mt-3 text-sm leading-7 text-slate-300">
                                        {isFa
                                            ? "برای درخواست دسترسی، اصلاح، حذف یا سایر حقوق مربوط به اطلاعات شخصی، از کانال رسمی حریم خصوصی WrapLink استفاده کنید."
                                            : "For access, correction, deletion or other privacy requests, use the official WrapLink privacy contact."}
                                    </p>

                                </div>

                            </div>

                        </section>

                    </div>

                </div>

            </div>
        </main>
    );
}

function PrivacyCard({
    icon,
    title,
    text,
}: {
    icon: React.ReactNode;
    title: string;
    text: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                {icon}
            </div>

            <h3 className="font-bold">
                {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
                {text}
            </p>

        </div>
    );
}
