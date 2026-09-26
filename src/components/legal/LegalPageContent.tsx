"use client";

import {useLocale} from "next-intl";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowRight,
    Ban,
    CreditCard,
    FileText,
    Lock,
    RefreshCcw,
    Scale,
    Shield,
    Wallet,
} from "lucide-react";

type Section = {
    id: string;
    title: string;
    paragraphs?: string[];
    bullets?: string[];
};

const content = {
    en: {
        badge: "LEGAL & POLICIES",
        title: "WrapLink Legal Center",
        description:
            "These rules explain how WrapLink accounts, connectivity services, wallets, payments, purchases, refunds, marketplace orders and acceptable use work.",
        effective: "Effective date: September 26, 2026",
        important:
            "Please read these terms before creating an account or purchasing a WrapLink service. By creating an account, you confirm that you have read and accepted the Terms of Service.",
        sections: [
            {
                id: "service",
                title: "1. About the WrapLink Service",
                paragraphs: [
                    "WrapLink provides network connectivity and digital services intended to improve connectivity management, routing, bandwidth management and related services.",
                    "Available features may include account management, connection services, DNS or routing features, bandwidth monitoring, support, wallet services, marketplace purchases and other services made available through the platform.",
                    "Specific products, plans, limits, prices and availability may change. The conditions displayed at the time of purchase form part of the applicable transaction.",
                ],
            },
            {
                id: "account",
                title: "2. Account Rules",
                bullets: [
                    "You must provide accurate and current registration information.",
                    "You are responsible for protecting your password, authentication credentials, access tokens and account.",
                    "You must not share an account where sharing is prohibited by the applicable plan.",
                    "You are responsible for activity performed through your account unless you promptly report unauthorized access.",
                    "You must not create accounts for fraudulent, abusive or unlawful purposes.",
                    "WrapLink may require identity, payment or transaction verification where reasonably necessary for security, fraud prevention or legal compliance.",
                    "Accounts may be suspended or restricted where there is a security, payment, abuse or legal-compliance concern.",
                ],
            },
            {
                id: "acceptable-use",
                title: "3. Acceptable Use",
                paragraphs: [
                    "WrapLink services must be used only for lawful purposes and in accordance with these rules and applicable laws.",
                ],
                bullets: [
                    "Do not use WrapLink to attack, scan, compromise or gain unauthorized access to systems or networks.",
                    "Do not distribute malware, ransomware, credential theft tools or other malicious software.",
                    "Do not conduct denial-of-service attacks, abusive traffic generation or deliberate network disruption.",
                    "Do not use the service for fraud, phishing, impersonation, credential theft or payment abuse.",
                    "Do not attempt to bypass service limits, authentication, security controls, payment controls or technical restrictions.",
                    "Do not use the service to facilitate activity that violates applicable law.",
                    "Do not interfere with the availability, security or integrity of WrapLink infrastructure or another customer's service.",
                ],
            },
            {
                id: "connection",
                title: "4. Connection & Network Services",
                bullets: [
                    "Network performance depends on factors including location, ISP, routing, congestion, destination infrastructure and the user's device.",
                    "Latency, packet loss, throughput and availability are not guaranteed unless a particular plan expressly provides a service-level commitment.",
                    "WrapLink may modify routing, DNS, edge locations or network architecture to maintain or improve the service.",
                    "A connection being available does not guarantee access to every destination on the Internet.",
                    "Temporary interruption may occur because of maintenance, network failures, upstream providers, security incidents or circumstances outside WrapLink's reasonable control.",
                ],
            },
            {
                id: "plans",
                title: "5. Plans, Subscriptions & Usage",
                bullets: [
                    "Each plan is governed by the limits, duration, bandwidth allowance and features displayed when the plan is purchased.",
                    "Usage information displayed by the platform is intended to provide an operational measurement of service consumption.",
                    "A plan may become unavailable, expire or be restricted when its contractual period or included allowance ends.",
                    "Changing or upgrading a plan may create a new transaction and may be subject to the prices and conditions displayed at that time.",
                    "Unless a plan explicitly states otherwise, unused allowances do not automatically become cash or withdrawable wallet funds.",
                ],
            },
            {
                id: "wallet",
                title: "6. Wallet",
                paragraphs: [
                    "The WrapLink Wallet is an internal account balance used to pay for eligible WrapLink products and services. It is not intended to be a bank account, deposit account or general-purpose payment account.",
                ],
                bullets: [
                    "Wallet funds may be used only for eligible transactions supported by WrapLink.",
                    "The wallet balance is separate from your external bank, card or cryptocurrency account.",
                    "A wallet top-up is treated as a payment transaction once successfully credited to the account.",
                    "Users must not attempt to manipulate balances, duplicate credits, exploit payment failures or reverse legitimate transactions fraudulently.",
                    "WrapLink may temporarily restrict wallet activity when a transaction requires verification or investigation.",
                    "Where a refund is approved, WrapLink may return the amount through the applicable original payment method or wallet, subject to the applicable payment and refund rules.",
                    "Wallet balances are not automatically transferable between users unless a specific WrapLink feature expressly allows it.",
                ],
            },
            {
                id: "payments",
                title: "7. Payment Rules",
                paragraphs: [
                    "WrapLink may support multiple payment methods. The available methods can depend on country, product, transaction amount, risk controls and payment-provider availability.",
                ],
                bullets: [
                    "Wallet: an eligible order may be paid from the available WrapLink wallet balance.",
                    "Card-to-card / manual payment: where offered, the user must follow the exact payment instructions and submit accurate payment evidence when requested.",
                    "Cryptocurrency: where offered, the user must send the exact amount to the correct address and select the correct supported blockchain network.",
                    "ISP or partner payment: where offered, payment may be processed through the applicable ISP or partner according to that provider's rules.",
                    "Payment instructions shown for one transaction must not be reused for another transaction unless WrapLink explicitly states that they are reusable.",
                    "A payment is not considered successfully completed merely because the user has initiated a transfer. The transaction must be verified and credited by the applicable payment system.",
                    "Incorrect payment amount, wrong destination, unsupported cryptocurrency network, missing transaction reference or insufficient payment may delay or prevent crediting.",
                    "Users are responsible for checking payment details before confirming a transaction.",
                    "Payment-provider fees, blockchain network fees, bank fees or other third-party charges may apply where disclosed or imposed by the relevant provider.",
                    "WrapLink may delay fulfillment while a payment is being verified.",
                ],
            },
            {
                id: "crypto",
                title: "8. Cryptocurrency Payments",
                paragraphs: [
                    "Cryptocurrency payments are irreversible in many circumstances. A transaction sent to the wrong address or unsupported network may not be recoverable.",
                ],
                bullets: [
                    "Always verify the destination address before sending.",
                    "Always verify the supported blockchain network before sending.",
                    "Do not send a different token or asset than the one specified by WrapLink.",
                    "Blockchain confirmation times may vary.",
                    "Network fees are generally outside WrapLink's control.",
                    "A blockchain transaction is not automatically proof that the correct WrapLink order has been paid.",
                ],
            },
            {
                id: "checkout",
                title: "9. Checkout & Orders",
                bullets: [
                    "Adding an item to the basket does not create a completed purchase.",
                    "An order is created through the checkout process after the user confirms the transaction.",
                    "The final price, applicable taxes or fees, selected payment method and product information are shown during checkout where applicable.",
                    "An unpaid order may remain pending until payment is verified.",
                    "An order may be cancelled before confirmation or fulfillment where the applicable order state permits cancellation.",
                    "Once a digital service has been activated or a product has been fulfilled, cancellation or refund may be subject to the applicable refund rules and mandatory consumer rights.",
                    "Order status displayed in the account is the operational status recorded by WrapLink.",
                ],
            },
            {
                id: "refunds",
                title: "10. Refunds, Cancellation & Withdrawal",
                paragraphs: [
                    "Refund eligibility depends on the product, order status, payment method, applicable consumer law and whether the service has already been supplied or activated.",
                    "Where mandatory consumer rights apply, those rights are not excluded by these terms.",
                    "For eligible orders, WrapLink may require the order number, transaction reference and other information necessary to process the refund.",
                ],
                bullets: [
                    "Orders that have not yet been confirmed or fulfilled may be cancellable through the available cancellation mechanism.",
                    "A failed or duplicated payment may be investigated and corrected after verification.",
                    "Fraudulent, abusive or unauthorized refund requests may be rejected and may result in account restrictions.",
                    "Refund processing time can depend on the original payment provider or financial network.",
                    "Where applicable law provides a statutory withdrawal right, the statutory rules take precedence over conflicting contractual wording.",
                    "For digital services, withdrawal rights may be affected when performance begins, subject to the applicable law and the user's required express consent.",
                ],
            },
            {
                id: "market",
                title: "11. Marketplace Rules",
                bullets: [
                    "Marketplace products are subject to the description, price, availability and conditions shown on the relevant product page.",
                    "WrapLink may operate marketplace functionality directly or may provide access to products or services supplied by third parties.",
                    "Where a third party is the actual supplier, the applicable supplier information and contractual terms should be displayed where required.",
                    "Users must not manipulate product availability, orders, prices, reviews or marketplace functionality.",
                    "Orders may be cancelled or restricted where permitted by their status and the applicable product rules.",
                ],
            },
            {
                id: "support",
                title: "12. Support",
                bullets: [
                    "Users may create support tickets for service, account, payment or technical issues.",
                    "Support requests should contain accurate information and sufficient transaction details to allow investigation.",
                    "Do not include passwords, private keys, recovery codes or other unnecessary secrets in support tickets.",
                    "Support response times may vary depending on plan, severity, availability and the nature of the issue.",
                ],
            },
            {
                id: "security",
                title: "13. Security & Abuse Prevention",
                bullets: [
                    "WrapLink may use technical controls to detect fraud, account takeover, abusive traffic, payment abuse and other security threats.",
                    "Security controls may temporarily restrict an account or transaction while an investigation is performed.",
                    "Users must immediately report suspected unauthorized access or payment activity.",
                    "No Internet service can guarantee absolute security or uninterrupted availability.",
                ],
            },
            {
                id: "privacy",
                title: "14. Privacy & Personal Data",
                paragraphs: [
                    "WrapLink may process information necessary to provide accounts, authentication, connectivity, payments, orders, support, security and legal compliance.",
                    "Personal-data processing must be described in the WrapLink Privacy Policy, including the applicable purposes, legal bases, categories of data, retention, recipients, transfers and user rights.",
                    "The Privacy Policy is separate from these Terms and should be reviewed before creating an account.",
                ],
            },
            {
                id: "availability",
                title: "15. Availability & Changes",
                bullets: [
                    "WrapLink may perform maintenance, upgrades and security changes.",
                    "Features may be added, modified or discontinued.",
                    "Material contractual changes will be communicated through an appropriate channel where required by applicable law.",
                    "Nothing in these terms removes mandatory statutory rights.",
                ],
            },
            {
                id: "termination",
                title: "16. Suspension & Termination",
                bullets: [
                    "A user may stop using the service and may request account closure through the available account or support process.",
                    "WrapLink may suspend or terminate access where required for security, fraud prevention, payment abuse, unlawful activity, material breach or legal compliance.",
                    "Termination does not automatically eliminate obligations that arose before termination.",
                    "Refunds after termination remain subject to the applicable transaction and consumer rules.",
                ],
            },
            {
                id: "liability",
                title: "17. Liability",
                paragraphs: [
                    "Nothing in these Terms is intended to exclude or limit liability where such exclusion or limitation is prohibited by applicable law.",
                    "To the extent permitted by applicable law, WrapLink is not responsible for failures caused by third-party networks, ISPs, payment providers, blockchain networks, user equipment, Internet-wide outages or events outside WrapLink's reasonable control.",
                ],
            },
            {
                id: "law",
                title: "18. Governing Law & Disputes",
                paragraphs: [
                    "The governing law, jurisdiction and dispute-resolution mechanism applicable to WrapLink must be identified in the final published version based on the legal entity operating the service and the countries in which the service is offered.",
                    "Mandatory consumer protection rules applicable to the user remain unaffected.",
                ],
            },
            {
                id: "contact",
                title: "19. Legal Contact",
                paragraphs: [
                    "For legal, privacy, payment or consumer-rights questions, use the official WrapLink support or legal contact channel published on the website.",
                    "The final production version should identify the legal entity name, registered address, company registration details, VAT/tax identification where applicable, legal contact email and privacy contact/DPO where required.",
                ],
            },
        ] as Section[],
        agree:
            "By creating a WrapLink account, you confirm that you have read and agree to the Terms of Service and acknowledge the Privacy Policy.",
        privacyLink: "Privacy Policy",
        termsLink: "Terms of Service",
        register: "Create an account",
        home: "Back to home",
    },

    fa: {
        badge: "قوانین و مقررات",
        title: "مرکز قوانین WrapLink",
        description:
            "این قوانین نحوه استفاده از حساب کاربری، خدمات اتصال، کیف پول، پرداخت، خرید، سفارش‌های بازار، بازپرداخت و استفاده مجاز از WrapLink را مشخص می‌کند.",
        effective: "تاریخ اجرا: ۲۶ سپتامبر ۲۰۲۶",
        important:
            "لطفاً پیش از ایجاد حساب یا خرید هر خدمت WrapLink این قوانین را مطالعه کنید. با ایجاد حساب، تأیید می‌کنید که شرایط استفاده را مطالعه و پذیرفته‌اید.",
        sections: [
            {
                id: "service",
                title: "۱. درباره خدمات WrapLink",
                paragraphs: [
                    "WrapLink خدمات اتصال شبکه و خدمات دیجیتال مرتبط با مدیریت اتصال، مسیریابی، مدیریت پهنای باند و سرویس‌های مرتبط ارائه می‌کند.",
                    "امکانات می‌تواند شامل مدیریت حساب، خدمات اتصال، قابلیت‌های DNS یا مسیریابی، پایش پهنای باند، پشتیبانی، کیف پول، خرید از بازار و سایر خدمات ارائه‌شده در پلتفرم باشد.",
                    "محصولات، پلن‌ها، محدودیت‌ها، قیمت‌ها و دسترسی ممکن است تغییر کند. اطلاعات نمایش داده‌شده هنگام خرید، بخشی از شرایط همان تراکنش محسوب می‌شود.",
                ],
            },
            {
                id: "account",
                title: "۲. قوانین حساب کاربری",
                bullets: [
                    "اطلاعات ثبت‌نام باید صحیح و به‌روز باشد.",
                    "حفاظت از رمز عبور، اطلاعات احراز هویت، توکن‌های دسترسی و حساب بر عهده کاربر است.",
                    "اشتراک‌گذاری حساب در مواردی که پلن مربوطه اجازه نمی‌دهد ممنوع است.",
                    "فعالیت‌های انجام‌شده از طریق حساب، تا زمان گزارش دسترسی غیرمجاز، بر عهده دارنده حساب است.",
                    "ایجاد حساب برای فعالیت متقلبانه، سوءاستفاده یا غیرقانونی ممنوع است.",
                    "WrapLink می‌تواند برای امنیت، جلوگیری از تقلب یا رعایت الزامات قانونی درخواست احراز هویت یا بررسی تراکنش کند.",
                    "در صورت وجود نگرانی امنیتی، پرداختی، سوءاستفاده یا قانونی، حساب ممکن است موقتاً محدود یا تعلیق شود.",
                ],
            },
            {
                id: "acceptable-use",
                title: "۳. استفاده مجاز",
                paragraphs: [
                    "استفاده از WrapLink فقط برای اهداف قانونی و مطابق این قوانین و قوانین لازم‌الاجرا مجاز است.",
                ],
                bullets: [
                    "استفاده برای حمله، اسکن، نفوذ یا دسترسی غیرمجاز به سیستم‌ها و شبکه‌ها ممنوع است.",
                    "انتشار بدافزار، باج‌افزار، ابزار سرقت اطلاعات یا نرم‌افزار مخرب ممنوع است.",
                    "حملات منع سرویس، تولید ترافیک مخرب یا ایجاد اختلال عمدی در شبکه ممنوع است.",
                    "فیشینگ، جعل هویت، سرقت اعتبارنامه و سوءاستفاده پرداختی ممنوع است.",
                    "دور زدن محدودیت‌ها، احراز هویت، کنترل‌های امنیتی یا محدودیت‌های فنی ممنوع است.",
                    "استفاده برای فعالیت مغایر با قوانین لازم‌الاجرا ممنوع است.",
                ],
            },
            {
                id: "connection",
                title: "۴. اتصال و خدمات شبکه",
                bullets: [
                    "کیفیت شبکه به عواملی مانند موقعیت، ISP، مسیریابی، شلوغی شبکه، مقصد و دستگاه کاربر بستگی دارد.",
                    "مگر اینکه در پلن مشخصی تعهد سطح خدمت وجود داشته باشد، تأخیر، packet loss، سرعت و دسترسی تضمین نمی‌شود.",
                    "WrapLink می‌تواند برای نگهداری یا بهبود سرویس، مسیرها، DNS، edgeها یا معماری شبکه را تغییر دهد.",
                    "فعال بودن اتصال به معنی تضمین دسترسی به تمام مقاصد اینترنت نیست.",
                    "ممکن است به دلیل نگهداری، اختلال شبکه، سرویس‌دهندگان بالادستی یا شرایط خارج از کنترل منطقی WrapLink قطعی موقت رخ دهد.",
                ],
            },
            {
                id: "plans",
                title: "۵. پلن‌ها، اشتراک و مصرف",
                bullets: [
                    "هر پلن تابع مدت، حجم، محدودیت‌ها و امکانات نمایش‌داده‌شده هنگام خرید است.",
                    "اطلاعات مصرف برای نمایش میزان استفاده عملیاتی از سرویس ارائه می‌شود.",
                    "پس از پایان مدت یا سهمیه پلن، سرویس ممکن است منقضی یا محدود شود.",
                    "تغییر یا ارتقای پلن می‌تواند یک تراکنش جدید ایجاد کند.",
                    "مگر اینکه در پلن صراحتاً خلاف آن اعلام شده باشد، سهمیه استفاده‌نشده به وجه نقد یا موجودی قابل برداشت تبدیل نمی‌شود.",
                ],
            },
            {
                id: "wallet",
                title: "۶. کیف پول",
                paragraphs: [
                    "کیف پول WrapLink یک موجودی داخلی برای پرداخت محصولات و خدمات واجد شرایط WrapLink است و حساب بانکی، سپرده بانکی یا حساب پرداخت عمومی محسوب نمی‌شود.",
                ],
                bullets: [
                    "موجودی کیف پول فقط برای تراکنش‌های مجاز WrapLink قابل استفاده است.",
                    "موجودی کیف پول مستقل از حساب بانکی، کارت یا حساب رمزارزی خارجی کاربر است.",
                    "پس از موفقیت تراکنش شارژ، مبلغ در کیف پول اعتبار داده می‌شود.",
                    "دستکاری موجودی، ایجاد اعتبار تکراری، سوءاستفاده از خطای پرداخت یا برگشت متقلبانه تراکنش ممنوع است.",
                    "در صورت نیاز به بررسی امنیتی یا پرداختی، WrapLink می‌تواند عملیات کیف پول را موقتاً محدود کند.",
                    "در صورت تأیید بازپرداخت، مبلغ می‌تواند مطابق قوانین پرداخت و بازپرداخت از مسیر پرداخت مربوطه یا کیف پول برگشت داده شود.",
                    "انتقال موجودی بین کاربران تنها در صورت ارائه رسمی این قابلیت توسط WrapLink مجاز است.",
                ],
            },
            {
                id: "payments",
                title: "۷. قوانین پرداخت",
                paragraphs: [
                    "WrapLink ممکن است روش‌های مختلف پرداخت ارائه کند. روش‌های قابل استفاده می‌تواند بر اساس کشور، محصول، مبلغ، کنترل‌های ریسک و دسترسی سرویس‌دهنده پرداخت متفاوت باشد.",
                ],
                bullets: [
                    "کیف پول: سفارش واجد شرایط می‌تواند از موجودی کیف پول پرداخت شود.",
                    "کارت‌به‌کارت / پرداخت دستی: در صورت ارائه، کاربر باید دقیقاً طبق دستور پرداخت عمل و در صورت درخواست، رسید معتبر ارسال کند.",
                    "رمزارز: در صورت ارائه، مبلغ دقیق باید به آدرس صحیح و روی شبکه پشتیبانی‌شده ارسال شود.",
                    "پرداخت ISP یا شریک: در صورت ارائه، پرداخت طبق قوانین سرویس‌دهنده مربوطه انجام می‌شود.",
                    "اطلاعات پرداخت یک تراکنش نباید برای تراکنش دیگری استفاده شود مگر اینکه WrapLink صراحتاً اعلام کرده باشد.",
                    "صرف شروع انتقال به معنی موفقیت پرداخت نیست؛ پرداخت باید توسط سیستم مربوطه تأیید و اعتباردهی شود.",
                    "مبلغ اشتباه، شبکه رمزارزی اشتباه، شناسه تراکنش ناقص یا پرداخت ناکافی می‌تواند باعث تأخیر یا عدم اعتباردهی شود.",
                    "بررسی اطلاعات پرداخت قبل از تأیید تراکنش بر عهده کاربر است.",
                    "کارمزد بانک، شبکه بلاکچین، پرداخت‌دهنده یا سایر طرف‌های ثالث ممکن است اعمال شود.",
                    "WrapLink می‌تواند تا پایان بررسی پرداخت، انجام سفارش را متوقف کند.",
                ],
            },
            {
                id: "crypto",
                title: "۸. پرداخت رمزارزی",
                paragraphs: [
                    "پرداخت رمزارزی در بسیاری از موارد قابل برگشت نیست و ارسال به آدرس یا شبکه اشتباه ممکن است قابل بازیابی نباشد.",
                ],
                bullets: [
                    "آدرس مقصد را قبل از ارسال بررسی کنید.",
                    "شبکه صحیح را قبل از ارسال بررسی کنید.",
                    "توکن یا دارایی متفاوت از مورد اعلام‌شده ارسال نکنید.",
                    "زمان تأیید بلاکچین ممکن است متفاوت باشد.",
                    "کارمزد شبکه بلاکچین معمولاً خارج از کنترل WrapLink است.",
                    "تراکنش بلاکچین به‌تنهایی اثبات پرداخت صحیح سفارش WrapLink نیست.",
                ],
            },
            {
                id: "checkout",
                title: "۹. سبد خرید و سفارش",
                bullets: [
                    "افزودن محصول به سبد خرید به معنی تکمیل خرید نیست.",
                    "پس از تأیید تراکنش در فرآیند checkout سفارش ایجاد می‌شود.",
                    "قیمت نهایی، مالیات یا کارمزدهای قابل اعمال، روش پرداخت و اطلاعات محصول در checkout نمایش داده می‌شود.",
                    "سفارش پرداخت‌نشده می‌تواند تا زمان تأیید پرداخت در وضعیت انتظار باقی بماند.",
                    "در صورت مجاز بودن وضعیت سفارش، سفارش قبل از تأیید یا انجام قابل لغو است.",
                    "پس از فعال شدن سرویس دیجیتال، لغو یا بازپرداخت تابع قوانین محصول و حقوق قانونی مصرف‌کننده است.",
                    "وضعیت سفارش نمایش‌داده‌شده در حساب، وضعیت عملیاتی ثبت‌شده توسط WrapLink است.",
                ],
            },
            {
                id: "refunds",
                title: "۱۰. لغو، بازپرداخت و انصراف",
                paragraphs: [
                    "شرایط بازپرداخت به نوع محصول، وضعیت سفارش، روش پرداخت، قوانین لازم‌الاجرا و شروع یا عدم شروع ارائه سرویس بستگی دارد.",
                    "حقوق قانونی اجباری مصرف‌کننده با این شرایط حذف نمی‌شود.",
                ],
                bullets: [
                    "سفارش تأییدنشده یا انجام‌نشده، در صورت مجاز بودن وضعیت، می‌تواند لغو شود.",
                    "پرداخت ناموفق یا تکراری پس از بررسی قابل اصلاح است.",
                    "درخواست بازپرداخت متقلبانه یا سوءاستفاده‌گرانه می‌تواند رد و حساب محدود شود.",
                    "زمان بازپرداخت می‌تواند به سرویس‌دهنده پرداخت وابسته باشد.",
                    "در صورت وجود حق قانونی انصراف، قوانین اجباری قانونی بر متن قراردادی اولویت دارد.",
                    "در سرویس‌های دیجیتال، شروع ارائه سرویس می‌تواند بر حق انصراف اثر بگذارد، مطابق قانون و رضایت صریح موردنیاز.",
                ],
            },
            {
                id: "market",
                title: "۱۱. قوانین بازار",
                bullets: [
                    "محصولات بازار تابع توضیحات، قیمت، موجودی و شرایط نمایش‌داده‌شده هستند.",
                    "WrapLink ممکن است مستقیماً فروشنده باشد یا محصولات و خدمات اشخاص ثالث را ارائه کند.",
                    "در صورت فروش توسط شخص ثالث، اطلاعات فروشنده و شرایط لازم باید در محل مناسب نمایش داده شود.",
                    "دستکاری موجودی، قیمت، سفارش، امتیاز یا عملکرد بازار ممنوع است.",
                    "سفارش بر اساس وضعیت و قوانین محصول ممکن است لغو یا محدود شود.",
                ],
            },
            {
                id: "support",
                title: "۱۲. پشتیبانی",
                bullets: [
                    "کاربران می‌توانند برای مشکلات حساب، پرداخت، فنی یا سرویس تیکت ایجاد کنند.",
                    "اطلاعات صحیح و جزئیات کافی تراکنش باید ارائه شود.",
                    "رمز عبور، کلید خصوصی، کد بازیابی یا اطلاعات محرمانه غیرضروری را در تیکت ارسال نکنید.",
                    "زمان پاسخ بسته به پلن، شدت مشکل، ظرفیت پشتیبانی و نوع درخواست متفاوت است.",
                ],
            },
            {
                id: "security",
                title: "۱۳. امنیت و جلوگیری از سوءاستفاده",
                bullets: [
                    "WrapLink ممکن است برای شناسایی تقلب، تصاحب حساب، ترافیک مخرب و سوءاستفاده پرداختی از کنترل‌های فنی استفاده کند.",
                    "در زمان بررسی امنیتی، حساب یا تراکنش ممکن است موقتاً محدود شود.",
                    "دسترسی غیرمجاز یا تراکنش مشکوک باید فوراً گزارش شود.",
                    "هیچ سرویس اینترنتی امنیت یا دسترسی ۱۰۰٪ تضمین‌شده ندارد.",
                ],
            },
            {
                id: "privacy",
                title: "۱۴. حریم خصوصی و اطلاعات شخصی",
                paragraphs: [
                    "WrapLink ممکن است اطلاعات لازم برای حساب، احراز هویت، اتصال، پرداخت، سفارش، پشتیبانی، امنیت و رعایت الزامات قانونی را پردازش کند.",
                    "جزئیات پردازش اطلاعات شخصی باید در Privacy Policy/سیاست حریم خصوصی شامل اهداف، مبنای قانونی، دسته‌های اطلاعات، نگهداری، دریافت‌کنندگان، انتقال‌ها و حقوق کاربر توضیح داده شود.",
                    "سیاست حریم خصوصی سندی جدا از شرایط استفاده است و باید پیش از ایجاد حساب مطالعه شود.",
                ],
            },
            {
                id: "availability",
                title: "۱۵. دسترسی و تغییرات سرویس",
                bullets: [
                    "WrapLink ممکن است عملیات نگهداری، ارتقا و تغییرات امنیتی انجام دهد.",
                    "امکانات می‌توانند اضافه، تغییر یا حذف شوند.",
                    "تغییرات مهم قراردادی در صورت الزام قانونی از روش مناسب اطلاع‌رسانی می‌شوند.",
                    "هیچ بخش این قوانین حقوق قانونی اجباری کاربر را حذف نمی‌کند.",
                ],
            },
            {
                id: "termination",
                title: "۱۶. تعلیق و خاتمه",
                bullets: [
                    "کاربر می‌تواند استفاده از سرویس را متوقف و از روش موجود درخواست بسته‌شدن حساب کند.",
                    "WrapLink در صورت مسائل امنیتی، تقلب، سوءاستفاده پرداختی، فعالیت غیرقانونی، نقض مهم قوانین یا الزام قانونی می‌تواند دسترسی را تعلیق یا خاتمه دهد.",
                    "خاتمه حساب تعهدات ایجادشده پیش از خاتمه را خودکار از بین نمی‌برد.",
                    "بازپرداخت پس از خاتمه تابع قوانین تراکنش و حقوق مصرف‌کننده است.",
                ],
            },
            {
                id: "liability",
                title: "۱۷. مسئولیت",
                paragraphs: [
                    "هیچ بخشی از این قوانین قصد حذف یا محدود کردن مسئولیتی را که طبق قانون قابل حذف یا محدود کردن نیست ندارد.",
                    "تا حد مجاز قانون، WrapLink مسئول اختلال ناشی از شبکه‌های ثالث، ISP، سرویس‌دهندگان پرداخت، شبکه‌های بلاکچین، تجهیزات کاربر یا رخدادهای خارج از کنترل منطقی خود نیست.",
                ],
            },
            {
                id: "law",
                title: "۱۸. قانون حاکم و اختلافات",
                paragraphs: [
                    "قانون حاکم، حوزه قضایی و روش حل اختلاف باید در نسخه نهایی بر اساس شخصیت حقوقی بهره‌بردار WrapLink و کشورهای محل ارائه سرویس تعیین و درج شود.",
                    "حقوق اجباری مصرف‌کننده همچنان محفوظ است.",
                ],
            },
            {
                id: "contact",
                title: "۱۹. تماس حقوقی",
                paragraphs: [
                    "برای مسائل حقوقی، حریم خصوصی، پرداخت یا حقوق مصرف‌کننده از کانال رسمی حقوقی یا پشتیبانی اعلام‌شده در سایت WrapLink استفاده کنید.",
                    "نسخه نهایی تولید باید نام شخصیت حقوقی، نشانی ثبت‌شده، شماره ثبت، شناسه مالیاتی در صورت وجود، ایمیل حقوقی و در صورت الزام اطلاعات مسئول حفاظت از داده را مشخص کند.",
                ],
            },
        ] as Section[],
        agree:
            "با ایجاد حساب WrapLink تأیید می‌کنید که شرایط استفاده را مطالعه و قبول کرده‌اید و سیاست حریم خصوصی را مطالعه کرده‌اید.",
        privacyLink: "سیاست حریم خصوصی",
        termsLink: "شرایط استفاده",
        register: "ایجاد حساب",
        home: "بازگشت به خانه",
    },
};

export default function LegalPageContent() {
    const locale = useLocale();
    const isFa = locale === "fa";
    const data = isFa ? content.fa : content.en;

    return (
        <main
            dir={isFa ? "rtl" : "ltr"}
            className="min-h-screen bg-[#020509] px-4 py-16 text-white sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 max-w-4xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-semibold tracking-widest text-cyan-300">
                        <Scale className="h-4 w-4"/>
                        {data.badge}
                    </div>

                    <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                        {data.title}
                    </h1>

                    <p className="mt-5 text-lg leading-8 text-slate-300">
                        {data.description}
                    </p>

                    <p className="mt-4 text-sm text-slate-500">
                        {data.effective}
                    </p>
                </div>

                <div className="mb-10 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
                    <div className="flex gap-4">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300"/>
                        <p className="text-sm leading-7 text-amber-100">
                            {data.important}
                        </p>
                    </div>
                </div>

                <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                            <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                                {isFa ? "فهرست" : "Contents"}
                            </p>

                            <nav className="space-y-1">
                                {data.sections.map((section) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className="block rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
                                    >
                                        {section.title}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    <div className="space-y-5">
                        {data.sections.map((section) => (
                            <section
                                id={section.id}
                                key={section.id}
                                className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8"
                            >
                                <h2 className="mb-5 text-xl font-bold text-white">
                                    {section.title}
                                </h2>

                                {section.paragraphs?.map(
                                    (paragraph, index) => (
                                        <p
                                            key={index}
                                            className="mb-4 text-sm leading-8 text-slate-300 last:mb-0"
                                        >
                                            {paragraph}
                                        </p>
                                    )
                                )}

                                {section.bullets && (
                                    <ul className="space-y-3">
                                        {section.bullets.map(
                                            (bullet, index) => (
                                                <li
                                                    key={index}
                                                    className="flex gap-3 text-sm leading-7 text-slate-300"
                                                >
                                                    <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"/>
                                                    <span>{bullet}</span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                )}
                            </section>
                        ))}

                        <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6 sm:p-8">
                            <div className="flex items-start gap-4">
                                <Shield className="mt-1 h-6 w-6 shrink-0 text-cyan-300"/>

                                <div>
                                    <h2 className="text-lg font-bold">
                                        {isFa
                                            ? "تأیید هنگام ایجاد حساب"
                                            : "Account acceptance"}
                                    </h2>

                                    <p className="mt-3 text-sm leading-7 text-slate-300">
                                        {data.agree}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <Link
                                            href={
                                                isFa
                                                    ? "/fa/auth/register"
                                                    : "/auth/register"
                                            }
                                            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                                        >
                                            {data.register}
                                            <ArrowRight className="h-4 w-4"/>
                                        </Link>

                                        <Link
                                            href={
                                                isFa
                                                    ? "/fa"
                                                    : "/"
                                            }
                                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                                        >
                                            {data.home}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}