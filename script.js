const messageTab = document.getElementById("message-tab");
const linkTab = document.getElementById("link-tab");

const messagePanel = document.getElementById("message-panel");
const linkPanel = document.getElementById("link-panel");

const messageInput = document.getElementById("message-input");
const linkInput = document.getElementById("link-input");

const messageCount = document.getElementById("message-count");

const verifyButton = document.getElementById("verify-button");
const newCheckButton = document.getElementById("new-check-button");

const resultSection = document.getElementById("result-section");
const resultTitle = document.getElementById("result-title");
const resultSummary = document.getElementById("result-summary");
const resultLevel = document.getElementById("result-level");

const indicatorsList = document.getElementById("indicators-list");
const indicatorCount = document.getElementById("indicator-count");

let currentMode = "message";


function switchMode(mode) {
    currentMode = mode;

    const isMessage = mode === "message";

    messageTab.classList.toggle("active", isMessage);
    linkTab.classList.toggle("active", !isMessage);

    messagePanel.classList.toggle("active", isMessage);
    linkPanel.classList.toggle("active", !isMessage);

    messageTab.setAttribute("aria-selected", isMessage);
    linkTab.setAttribute("aria-selected", !isMessage);
}


messageTab.addEventListener("click", () => {
    switchMode("message");
});


linkTab.addEventListener("click", () => {
    switchMode("link");
});


messageInput.addEventListener("input", () => {
    messageCount.textContent = messageInput.value.length;
});


function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .trim();
}


function createIndicator(title, description) {
    const item = document.createElement("div");

    item.className = "indicator-item";

    item.innerHTML = `
        <span class="indicator-number"></span>

        <div class="indicator-content">
            <h4>${title}</h4>
            <p>${description}</p>
        </div>
    `;

    return item;
}


function displayIndicators(indicators) {
    indicatorsList.innerHTML = "";

    indicators.forEach((indicator, index) => {
        const item = createIndicator(
            indicator.title,
            indicator.description
        );

        item.querySelector(".indicator-number").textContent =
            String(index + 1).padStart(2, "0");

        indicatorsList.appendChild(item);
    });

    indicatorCount.textContent =
        `${indicators.length} ${indicators.length === 1 ? "مؤشر" : "مؤشرات"}`;
}


function analyzeMessage(message) {
    const text = normalizeText(message);

    const indicators = [];

    const sensitiveWords = [
        "كلمه المرور",
        "كلمة المرور",
        "password",
        "passcode",
        "رمز التحقق",
        "otp",
        "verification code",
        "رقم البطاقه",
        "رقم البطاقة",
        "بياناتك البنكيه",
        "بياناتك البنكية",
        "حسابك البنكي",
        "بيانات الدخول",
        "login"
    ];

    const urgencyWords = [
        "عاجل",
        "فورا",
        "فوراً",
        "الان",
        "الآن",
        "خلال دقائق",
        "آخر فرصه",
        "آخر فرصة",
        "لا تتاخر",
        "لا تتأخر",
        "urgent",
        "immediately",
        "now",
        "final warning",
        "act now"
    ];

    const authorityWords = [
        "البنك",
        "وزارة",
        "حسابك الحكومي",
        "نفاذ",
        "ابشر",
        "أبشر",
        "stc",
        "aramco",
        "bank",
        "government",
        "official",
        "support"
    ];

    const urlPattern = /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|sa|io|co|me|info|xyz))/i;

    const hasSensitiveRequest = sensitiveWords.some(word =>
        text.includes(normalizeText(word))
    );

    const hasUrgency = urgencyWords.some(word =>
        text.includes(normalizeText(word))
    );

    const mentionsAuthority = authorityWords.some(word =>
        text.includes(normalizeText(word))
    );

    const containsLink = urlPattern.test(message);

    if (hasSensitiveRequest) {
        indicators.push({
            title: "طلب معلومات حساسة",
            description:
                "قد يتضمن المحتوى طلبًا لكلمة مرور أو رمز تحقق أو معلومات شخصية لا يُنصح بمشاركتها."
        });
    }

    if (hasUrgency) {
        indicators.push({
            title: "أسلوب استعجالي",
            description:
                "توجد عبارات تضغط على المستخدم لاتخاذ إجراء سريع، وهو أسلوب شائع في محاولات الخداع."
        });
    }

    if (containsLink) {
        indicators.push({
            title: "وجود رابط",
            description:
                "يحتوي المحتوى على رابط. تحقق من عنوان الموقع والجهة المرسلة قبل فتحه."
        });
    }

    if (mentionsAuthority) {
        indicators.push({
            title: "ادعاء الانتماء لجهة موثوقة",
            description:
                "يشير المحتوى إلى جهة رسمية أو معروفة، لذلك من المهم التأكد من أن الرسالة صادرة منها فعلًا."
        });
    }

    return indicators;
}


function analyzeLink(link) {
    const indicators = [];

    const cleanedLink = link.trim();

    const suspiciousExtensions = [
        ".xyz",
        ".top",
        ".click",
        ".work",
        ".zip",
        ".tk",
        ".ml",
        ".ga",
        ".cf"
    ];

    const hasSuspiciousExtension = suspiciousExtensions.some(extension =>
        cleanedLink.toLowerCase().includes(extension)
    );

    const hasIPAddress =
        /https?:\/\/(?:\d{1,3}\.){3}\d{1,3}/i.test(cleanedLink);

    const hasAtSymbol = cleanedLink.includes("@");

    const hasLongDomain =
        cleanedLink.replace(/^https?:\/\//i, "").split("/")[0].length > 45;

    const hasHttp =
        /^http:\/\//i.test(cleanedLink);

    if (hasIPAddress) {
        indicators.push({
            title: "استخدام عنوان رقمي بدل اسم الموقع",
            description:
                "يستخدم الرابط عنوان IP بدل اسم نطاق واضح، لذلك يُنصح بالحذر والتحقق من مصدره."
        });
    }

    if (hasAtSymbol) {
        indicators.push({
            title: "صيغة رابط غير مألوفة",
            description:
                "يحتوي الرابط على الرمز @، وهي صيغة تستحق المراجعة قبل المتابعة."
        });
    }

    if (hasSuspiciousExtension) {
        indicators.push({
            title: "امتداد نطاق يستحق الانتباه",
            description:
                "يستخدم الرابط امتدادًا قد يكون أقل شيوعًا، لذلك يُنصح بالتحقق من الجهة المالكة للموقع."
        });
    }

    if (hasLongDomain) {
        indicators.push({
            title: "عنوان نطاق طويل وغير مألوف",
            description:
                "يبدو اسم النطاق طويلًا بشكل غير معتاد، وقد يستحق التحقق من مصدره."
        });
    }

    if (hasHttp) {
        indicators.push({
            title: "الاتصال غير مشفّر",
            description:
                "الرابط يبدأ بـ HTTP بدل HTTPS، لذلك لا يُنصح بإدخال معلومات حساسة عبره."
        });
    }

    return indicators;
}


function showResult(indicators) {
    resultSection.classList.remove("hidden");

    if (indicators.length === 0) {
        resultTitle.textContent = "موثوق مبدئيًا";
        resultSummary.textContent =
            "لم تظهر مؤشرات واضحة تستدعي القلق في الفحص الأولي، لكن لا يمكن اعتبار المحتوى آمنًا بشكل مطلق.";
        resultLevel.textContent = "مستوى الانتباه: منخفض";

        displayIndicators([
            {
                title: "لا توجد مؤشرات واضحة",
                description:
                    "لم يجد الفحص الأولي أنماطًا مقلقة واضحة في المحتوى المدخل."
            }
        ]);

        return;
    }

    if (indicators.length <= 2) {
        resultTitle.textContent = "يحتاج إلى الانتباه";
        resultSummary.textContent =
            "ظهرت بعض المؤشرات التي تستحق المراجعة قبل التفاعل مع المحتوى.";
        resultLevel.textContent = "مستوى الانتباه: متوسط";
    } else {
        resultTitle.textContent = "يحتاج إلى الحذر";
        resultSummary.textContent =
            "وجدنا عدة مؤشرات تستحق المراجعة قبل التفاعل مع هذا المحتوى.";
        resultLevel.textContent = "مستوى الانتباه: مرتفع";
    }

    displayIndicators(indicators);
}


function showEmptyMessage() {
    resultSection.classList.remove("hidden");

    resultTitle.textContent = "لم يتم إدخال محتوى";
    resultSummary.textContent =
        "أدخل رسالة أو رابطًا أولًا حتى يتمكن وِثاق من إجراء الفحص.";
    resultLevel.textContent = "بانتظار الإدخال";

    displayIndicators([
        {
            title: "لا يوجد محتوى للتحليل",
            description:
                "أدخل البيانات المطلوبة ثم اضغط على «ابدأ التحقق» لإجراء الفحص."
        }
    ]);
}


function startVerification() {
    let indicators = [];

    if (currentMode === "message") {
        const message = messageInput.value.trim();

        if (!message) {
            showEmptyMessage();
            return;
        }

        indicators = analyzeMessage(message);
    }

    if (currentMode === "link") {
        const link = linkInput.value.trim();

        if (!link) {
            showEmptyMessage();
            return;
        }

        indicators = analyzeLink(link);
    }

    showResult(indicators);

    setTimeout(() => {
        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 100);
}


verifyButton.addEventListener("click", startVerification);


function resetVerification() {
    messageInput.value = "";
    linkInput.value = "";

    messageCount.textContent = "0";

    resultSection.classList.add("hidden");

    switchMode("message");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    setTimeout(() => {
        messageInput.focus();
    }, 500);
}


newCheckButton.addEventListener("click", resetVerification);


messageInput.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        startVerification();
    }
});


linkInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        startVerification();
    }
});


messageInput.addEventListener("focus", () => {
    messageInput.parentElement.classList.add("focused");
});


messageInput.addEventListener("blur", () => {
    messageInput.parentElement.classList.remove("focused");
});


linkInput.addEventListener("focus", () => {
    linkInput.parentElement.classList.add("focused");
});


linkInput.addEventListener("blur", () => {
    linkInput.parentElement.classList.remove("focused");
});