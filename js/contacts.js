document.addEventListener("DOMContentLoaded", () => {
  // Ensure globals (userId/firstName/lastName) are populated from cookies.
  if (typeof readCookie === "function") readCookie();

  // Redirect to login if not authenticated.
  if (!(typeof userId === "number") || userId < 1) {
    window.location.replace("/login.html");
    return;
  }

  const usernameText = document.querySelector(".username-text");
  if (usernameText) usernameText.textContent = `${firstName} ${lastName}`;

  const searchInput = document.getElementById("searchInput");
  const contactsGrid = document.getElementById("contactsGrid");
  const emptyState = document.getElementById("emptyState");

  const fabBtn = document.querySelector(".fab");
  const addModal = document.getElementById("addContactModal");
  const addForm = document.getElementById("addContactForm");
  const addCancel = document.getElementById("addCancel");
  const addError = document.getElementById("addContactError");
  const addName = document.getElementById("addName");
  const addNickname = document.getElementById("addNickname");
  const addPhone = document.getElementById("addPhone");
  const addEmail = document.getElementById("addEmail");

  const editModal = document.getElementById("editContactModal");
  const editForm = document.getElementById("editContactForm");
  const editCancel = document.getElementById("editCancel");
  const editError = document.getElementById("editContactError");
  const editName = document.getElementById("editName");
  const editNickname = document.getElementById("editNickname");
  const editPhone = document.getElementById("editPhone");
  const editEmail = document.getElementById("editEmail");

  let editingCard = null;

  if (!contactsGrid || !searchInput || !emptyState) return;

  const getCards = () => contactsGrid.querySelectorAll(".contact-card");

  const attachTilt = (card) => {
    if (!card) return;

    // Avoid attaching duplicate listeners (re-render/filter operations can call attachTilt repeatedly).
    if (card.getAttribute("data-tilt-attached") === "1") return;
    card.setAttribute("data-tilt-attached", "1");

    let rect = null;
    let rafId = 0;
    let latestX = 0;
    let latestY = 0;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const perspectivePx = 1000;
    const updateTransform = () => {
      rafId = 0;
      if (!rect) return;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Use pixel-based scaling so tilt strength stays consistent even when
      // card sizes change (e.g., scrollbar appears when many contacts render).
      const maxDeg = 8;
      const pixelsPerDeg = 45; // bigger = subtler tilt

      const dxPx = latestX - centerX;
      const dyPx = latestY - centerY;

      const rotateX = clamp(dyPx / pixelsPerDeg, -maxDeg, maxDeg);
      const rotateY = clamp(-dxPx / pixelsPerDeg, -maxDeg, maxDeg);

      card.style.transform = `perspective(${perspectivePx}px) translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    card.addEventListener("mouseenter", () => {
      rect = card.getBoundingClientRect();

      // Ensure a consistent base transform even if the user doesn't move the mouse.
      card.style.transform = `perspective(${perspectivePx}px) translateY(-10px) rotateX(0deg) rotateY(0deg)`;
    });

    card.addEventListener(
      "mousemove",
      (e) => {
        // Recompute rect every move so scrolling doesn't skew the tilt.
        rect = card.getBoundingClientRect();
        latestX = clamp(e.clientX - rect.left, 0, rect.width);
        latestY = clamp(e.clientY - rect.top, 0, rect.height);

        if (!rafId) rafId = requestAnimationFrame(updateTransform);
      },
      { passive: true },
    );

    card.addEventListener("mouseleave", () => {
      rect = null;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      card.style.transform = `perspective(${perspectivePx}px) translateY(0) rotateX(0deg) rotateY(0deg)`;
    });

    // No per-card window listeners; rect is recomputed on mousemove.
  };

  const updateCardAnimationDelays = (onlyCard = null) => {
    if (onlyCard) {
      const idx = Math.max(0, getCards().length - 1);
      onlyCard.style.animationDelay = `${idx * 0.1}s`;
      return;
    }

    getCards().forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  };

  function createContactCard(
    contact = {},
    isExampleCard = false,
    name = "Unknown",
    nickname = "Title/Nickname",
    phone = "Unknown",
    email = "Unknown",
  ) {
    const safeContact = contact && typeof contact === "object" ? contact : {};
    const resolvedId = Number(safeContact.id ?? safeContact.ID ?? 0) || 0;
    const resolvedName = safeContact.name ?? name;
    const resolvedNickname = safeContact.roleText ?? nickname;

    const resolvedPhone = safeContact.phone ?? phone;
    const resolvedEmail = safeContact.email ?? email;

    const card = document.createElement("div");
    card.className = "contact-card";
    card.setAttribute("data-id", String(resolvedId || ""));
    card.setAttribute("data-name", resolvedName);
    card.setAttribute("data-role", resolvedNickname || "");
    card.setAttribute("data-phone", String(resolvedPhone || ""));
    card.setAttribute("data-email", String(resolvedEmail || ""));
    card.setAttribute("data-example", String(!!isExampleCard));

    const glow = document.createElement("div");
    glow.className = "card-glow";
    card.appendChild(glow);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "delete-contact";
    delBtn.setAttribute("aria-label", "Delete contact");
    delBtn.title = "Delete contact";
    card.appendChild(delBtn);

    const avatarContainer = document.createElement("div");
    avatarContainer.className = "avatar-container";

    const avatarRing = document.createElement("div");
    avatarRing.className = "avatar-ring";
    avatarContainer.appendChild(avatarRing);

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.setAttribute(
      "style",
      "background: linear-gradient(135deg, #60a5fa20, #1b2735)",
    );
    avatar.textContent = (resolvedName || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0].toUpperCase())
      .join("");
    avatarContainer.appendChild(avatar);

    card.appendChild(avatarContainer);

    const nameEl = document.createElement("h3");
    nameEl.className = "contact-name";
    nameEl.textContent = resolvedName;
    card.appendChild(nameEl);

    const roleEl = document.createElement("p");
    roleEl.className = "contact-role";
    roleEl.textContent = resolvedNickname;
    card.appendChild(roleEl);

    const details = document.createElement("div");
    details.className = "contact-details";

    const phoneItem = document.createElement("div");
    phoneItem.className = "detail-item";
    phoneItem.innerHTML = `<span class="detail-icon">☎</span><span>${resolvedPhone}</span>`;
    details.appendChild(phoneItem);

    const emailItem = document.createElement("div");
    emailItem.className = "detail-item";
    emailItem.innerHTML = `<span class="detail-icon">✉</span><span>${resolvedEmail}</span>`;
    details.appendChild(emailItem);

    card.appendChild(details);

    const actions = document.createElement("div");
    actions.className = "card-actions";
    actions.innerHTML =
      '<button type="button" class="btn-action btn-secondary edit-contact">Edit Contact</button>';
    card.appendChild(actions);

    return card;
  }

  const HIDE_ANIMATION_MS = 300;
  const REFILTER_REAPPEAR_MS = 30;

  const getCardKey = (card) => {
    const idStr = String(card.getAttribute("data-id") || "").trim();
    const idNum = parseInt(idStr, 10);
    if (idNum > 0) return `id:${idNum}`;

    const name = String(card.getAttribute("data-name") || "")
      .trim()
      .toLowerCase();
    const email = String(card.getAttribute("data-email") || "")
      .trim()
      .toLowerCase();
    const phone = String(card.getAttribute("data-phone") || "").replace(/\D/g, "");
    return `fallback:${name}|${email}|${phone}`;
  };

  let lastVisibleKeys = new Set();

  const setCardVisible = (card, shouldShow) => {
    if (!card || !card.isConnected) return;

    const hideTimerId = parseInt(card.getAttribute("data-hide-timer") || "0", 10);
    if (hideTimerId) {
      clearTimeout(hideTimerId);
      card.removeAttribute("data-hide-timer");
    }

    if (shouldShow) {
      card.style.display = "";
      card.classList.remove("hide");
      return;
    }

    if (card.style.display === "none") return;
    card.classList.add("hide");
    const t = window.setTimeout(() => {
      if (card.classList.contains("hide")) {
        card.style.display = "none";
      }
      card.removeAttribute("data-hide-timer");
    }, HIDE_ANIMATION_MS);
    card.setAttribute("data-hide-timer", String(t));
  };

  const applyFilter = () => {
    const rawTerm = String(searchInput.value || "").trim().toLowerCase();
    const termDigits = rawTerm.replace(/\D/g, "");

    let visibleCount = 0;
    const nextVisibleKeys = new Set();

    const cards = Array.from(getCards());
    const decisions = new Map();

    cards.forEach((card) => {
      if (!card.isConnected) return;

      const name = (card.getAttribute("data-name") || "").toLowerCase();
      const nickname = (card.getAttribute("data-role") || "").toLowerCase();
      const email = (card.getAttribute("data-email") || "").toLowerCase();

      const phoneRaw = card.getAttribute("data-phone") || "";
      const phoneDigits = String(phoneRaw).replace(/\D/g, "");

      const matchesText =
        rawTerm === "" ||
        name.includes(rawTerm) ||
        nickname.includes(rawTerm) ||
        email.includes(rawTerm);

      const matchesPhone = rawTerm === "" || (termDigits !== "" && phoneDigits.includes(termDigits));

      const shouldShow = matchesText || matchesPhone;

      decisions.set(card, shouldShow);
      if (shouldShow) {
        visibleCount++;
        nextVisibleKeys.add(getCardKey(card));
      }
    });

    const eliminated =
      lastVisibleKeys.size > 0 && Array.from(lastVisibleKeys).some((k) => !nextVisibleKeys.has(k));

    if (eliminated) {
      cards.forEach((card) => {
        if (!card.isConnected) return;
        const hideTimerId = parseInt(card.getAttribute("data-hide-timer") || "0", 10);
        if (hideTimerId) {
          clearTimeout(hideTimerId);
          card.removeAttribute("data-hide-timer");
        }
        card.classList.remove("hide");
        card.classList.remove("refilter");
        card.style.display = "none";
      });

      window.setTimeout(() => {
        let visibleIndex = 0;
        cards.forEach((card) => {
          if (!card.isConnected) return;
          const shouldShow = decisions.get(card) === true;
          if (!shouldShow) return;

          card.style.display = "";
          card.classList.remove("hide");

          card.classList.remove("refilter");
          void card.offsetWidth;
          card.style.animationDelay = `${visibleIndex * 0.06}s`;
          card.classList.add("refilter");
          visibleIndex++;
        });
      }, REFILTER_REAPPEAR_MS);
    } else {
      cards.forEach((card) => {
        if (!card.isConnected) return;
        const shouldShow = decisions.get(card) === true;
        setCardVisible(card, shouldShow);
        if (shouldShow) card.classList.remove("refilter");
      });
    }

    emptyState.classList.toggle("show", visibleCount === 0);
    lastVisibleKeys = nextVisibleKeys;
  };

  const openAddModal = () => {
    if (!addModal || !addForm || !addName || !addError) return;
    addError.textContent = "";
    addModal.classList.add("show");
    addModal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => addName.focus());
  };

  const closeAddModal = () => {
    if (!addModal || !addForm || !addError) return;
    addModal.classList.remove("show");
    addModal.setAttribute("aria-hidden", "true");
    addError.textContent = "";
    addForm.reset();
  };

  const openEditModal = (card) => {
    if (!card || !editModal || !editForm || !editName || !editError) return;
    editingCard = card;

    editError.textContent = "";
    editName.value = card.getAttribute("data-name") || "";
    if (editNickname) editNickname.value = card.getAttribute("data-role") || "";
    if (editPhone) editPhone.value = card.getAttribute("data-phone") || "";
    if (editEmail) editEmail.value = card.getAttribute("data-email") || "";

    editModal.classList.add("show");
    editModal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => editName.focus());
  };

  const closeEditModal = () => {
    if (!editModal || !editForm || !editError) return;
    editModal.classList.remove("show");
    editModal.setAttribute("aria-hidden", "true");
    editError.textContent = "";
    editForm.reset();
    editingCard = null;
  };

  const renderContacts = (contacts) => {
    contactsGrid.innerHTML = "";
    (contacts || []).forEach((contact) =>
      contactsGrid.appendChild(createContactCard(contact, true)),
    );

    getCards().forEach(attachTilt);
    updateCardAnimationDelays();
    applyFilter();
  };

  const loadContacts = async () => {
    try {
      const contacts = await getContacts(userId, 0, 200);
      renderContacts(contacts);
    } catch (err) {
      console.warn("Failed to load contacts:", err);
      renderContacts([]);
    }
  };

  loadContacts();

  // delete contact
  contactsGrid.addEventListener("click", async (e) => {
    const deleteBtn = e.target.closest(".delete-contact");
    if (!deleteBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const card = deleteBtn.closest(".contact-card");
    if (!card) return;

    const contactId = parseInt(card.getAttribute("data-id") || "0", 10);

    if (!(contactId > 0)) {
      card.remove();
      applyFilter();
      return;
    }

    try {
      deleteBtn.disabled = true;
      await deleteContact({ userId: userId, contactId: contactId });
      card.remove();
      applyFilter();
    } catch (err) {
      deleteBtn.disabled = false;
      alert(err && err.message ? err.message : "Failed to delete contact.");
    }
  });

  // edit contact
  contactsGrid.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-contact");
    if (!editBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const card = editBtn.closest(".contact-card");
    if (!card) return;

    openEditModal(card);
  });

  // search filter
  searchInput.addEventListener("input", applyFilter);

  if (fabBtn) fabBtn.addEventListener("click", openAddModal);

  if (addCancel) addCancel.addEventListener("click", closeAddModal);
  if (addModal)
    addModal.addEventListener("click", (e) => {
      if (e.target === addModal) closeAddModal();
    });

  if (editCancel) editCancel.addEventListener("click", closeEditModal);
  if (editModal)
    editModal.addEventListener("click", (e) => {
      if (e.target === editModal) closeEditModal();
    });

  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (addModal && addModal.classList.contains("show")) closeAddModal();
    if (editModal && editModal.classList.contains("show")) closeEditModal();
  });

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  };

  const normalizePhoneDigits = (phone) => {
    return String(phone || "").replace(/\D/g, "");
  };

  const isValidPhone = (phone) => {
    return normalizePhoneDigits(phone).length === 10;
  };

  if (addForm)
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!addError || !addName) return;
      addError.textContent = "";

      const nameVal = String(addName.value || "").trim();
      const nickVal = String(addNickname && addNickname.value ? addNickname.value : "").trim();
      const phoneVal = String(addPhone && addPhone.value ? addPhone.value : "").trim();
      const emailVal = String(addEmail && addEmail.value ? addEmail.value : "").trim();

      if (!nameVal) {
        addError.textContent = "Name is required.";
        addName.focus();
        return;
      }

      if (emailVal && !isValidEmail(emailVal)) {
        addError.textContent = "Please enter a valid email (name@example.com).";
        if (addEmail) addEmail.focus();
        return;
      }

      if (phoneVal && !isValidPhone(phoneVal)) {
        addError.textContent = "Phone number must be 10 digits.";
        if (addPhone) addPhone.focus();
        return;
      }

      try {
        const resp = await addContact({
          userId: userId,
          name: nameVal,
          nickname: nickVal,
          phone: phoneVal,
          email: emailVal,
        });

        const savedId = parseInt(resp && resp.id ? resp.id : "0", 10) || 0;
        const nicknameToShow = resp && resp.nicknameSupported === false ? "" : nickVal;

        const newCard = createContactCard(
          {
            id: savedId,
            name: nameVal,
            roleText: nicknameToShow,
            phone: phoneVal,
            email: emailVal,
          },
          true,
        );

        contactsGrid.appendChild(newCard);
        attachTilt(newCard);
        updateCardAnimationDelays(newCard);
        closeAddModal();
        applyFilter();
      } catch (err) {
        addError.textContent = err && err.message ? err.message : "Failed to add contact.";
      }
    });

  if (editForm)
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!editError || !editName) return;
      editError.textContent = "";

      if (!editingCard || !editingCard.isConnected) {
        editError.textContent = "No contact selected.";
        return;
      }

      const contactId = parseInt(editingCard.getAttribute("data-id") || "0", 10);
      const nameVal = String(editName.value || "").trim();
      const nickVal = String(editNickname && editNickname.value ? editNickname.value : "").trim();
      const phoneVal = String(editPhone && editPhone.value ? editPhone.value : "").trim();
      const emailVal = String(editEmail && editEmail.value ? editEmail.value : "").trim();

      if (!nameVal) {
        editError.textContent = "Name is required.";
        editName.focus();
        return;
      }

      if (emailVal && !isValidEmail(emailVal)) {
        editError.textContent = "Please enter a valid email (name@example.com).";
        if (editEmail) editEmail.focus();
        return;
      }

      if (phoneVal && !isValidPhone(phoneVal)) {
        editError.textContent = "Phone number must be 10 digits.";
        if (editPhone) editPhone.focus();
        return;
      }

      if (!(contactId > 0)) {
        editError.textContent = "This contact can't be edited yet. Try reloading the page.";
        return;
      }

      try {
        const resp = await editContact({
          userId: userId,
          contactId: contactId,
          name: nameVal,
          nickname: nickVal,
          phone: phoneVal,
          email: emailVal,
        });

        editingCard.setAttribute("data-name", nameVal);
        editingCard.setAttribute("data-phone", phoneVal);
        editingCard.setAttribute("data-email", emailVal);

        if (!(resp && resp.nicknameSupported === false)) {
          editingCard.setAttribute("data-role", nickVal);
        }

        const nameEl = editingCard.querySelector(".contact-name");
        if (nameEl) nameEl.textContent = nameVal;

        const roleEl = editingCard.querySelector(".contact-role");
        if (roleEl)
          roleEl.textContent =
            resp && resp.nicknameSupported === false
              ? editingCard.getAttribute("data-role") || ""
              : nickVal;

        const detailSpans = editingCard.querySelectorAll(
          ".contact-details .detail-item span:last-child",
        );
        if (detailSpans && detailSpans.length >= 2) {
          detailSpans[0].textContent = phoneVal;
          detailSpans[1].textContent = emailVal;
        }

        closeEditModal();
        applyFilter();
      } catch (err) {
        editError.textContent = err && err.message ? err.message : "Failed to update contact.";
      }
    });
});
