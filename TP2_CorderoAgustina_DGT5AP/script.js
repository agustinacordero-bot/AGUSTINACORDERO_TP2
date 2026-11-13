
document.addEventListener("DOMContentLoaded", function () {
    const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elementos = document.querySelectorAll(
        ".section-title, .show-info, .show-image, .event-description, " +
        ".data-box, .location-info, .map, .experience-grid article, " +
        ".song, .album-image, .important-grid article, " +
        ".prohibited-grid article, .faq-list article, .contact-text, .contact form"
    );

    if (!reducirMovimiento && "IntersectionObserver" in window) {
        const observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("reveal-visible");
                    observador.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.08, rootMargin: "0px 0px -25px 0px" });

        elementos.forEach(function (elemento, indice) {
            elemento.classList.add("js-reveal");
            elemento.style.setProperty("--delay", ((indice % 4) * 110) + "ms");
            observador.observe(elemento);
        });
    }

    const barra = document.getElementById("scroll-progress");
    const volver = document.getElementById("volver-arriba");

    function actualizarScroll() {
        const recorrido = document.documentElement.scrollHeight - window.innerHeight;
        const porcentaje = recorrido > 0 ? (window.scrollY / recorrido) * 100 : 0;

        if (barra) barra.style.width = Math.min(100, porcentaje) + "%";
        if (volver) volver.classList.toggle("mostrar", window.scrollY > 400);
    }

    window.addEventListener("scroll", actualizarScroll, { passive: true });
    window.addEventListener("resize", actualizarScroll);
    actualizarScroll();

    if (volver) {
        volver.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: reducirMovimiento ? "auto" : "smooth"
            });
        });
    }

    document.querySelectorAll(".faq-list article").forEach(function (articulo) {
        const pregunta = articulo.querySelector(".faq-trigger");
        const respuesta = articulo.querySelector("p");

        if (!pregunta || !respuesta) return;

        respuesta.hidden = true;
        pregunta.setAttribute("aria-expanded", "false");

        function alternar() {
            respuesta.hidden = !respuesta.hidden;
            pregunta.setAttribute("aria-expanded", String(!respuesta.hidden));
        }

        pregunta.addEventListener("click", alternar);
    });

    const formulario = document.getElementById("contactForm");

    if (formulario) {
        formulario.setAttribute("novalidate", "");

        formulario.addEventListener("submit", function (evento) {
            evento.preventDefault();

            const nombre = document.getElementById("nombre");
            const correo = document.getElementById("correo");
            const mensaje = document.getElementById("mensaje");
            const respuesta = document.getElementById("respuestaFormulario");

            if (!nombre.value.trim() || !correo.value.trim() || !mensaje.value.trim()) {
                respuesta.textContent = "POR FAVOR, COMPLETÁ TODOS LOS CAMPOS.";
            } else if (!correo.checkValidity()) {
                respuesta.textContent = "INGRESÁ UN CORREO VÁLIDO.";
            } else {
                respuesta.textContent = "¡GRACIAS! ESTE FORMULARIO ES UNA DEMOSTRACIÓN.";
                formulario.reset();
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const checkout = document.querySelector(".checkout-layout");
    const ordersList = document.getElementById("orders-list");
    const storageKey = "sabrina-tp2-pedidos-demo";

    const pesos = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    });

    const pesosCuotas = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    function readOrders() {
        try {
            const orders = JSON.parse(localStorage.getItem(storageKey) || "[]");
            return Array.isArray(orders) ? orders : [];
        } catch (error) {
            return [];
        }
    }

    if (ordersList) {
        const orders = readOrders();

        if (orders.length > 0) {
            ordersList.innerHTML = "";
        }

        orders.slice().reverse().forEach(function (order) {
            const card = document.createElement("article");
            card.className = "order-card";

            const title = document.createElement("h2");
            title.textContent = "PEDIDO " + order.id;

            const detail = document.createElement("p");

            const datos = [
                order.fecha,
                order.sector,
                order.cantidad + " entrada(s)",
                pesos.format(order.total)
            ];

            if (order.tipoTarjeta) {
                let pago = order.tipoTarjeta;

                if (order.marcaTarjeta) {
                    pago += " " + order.marcaTarjeta;
                }

                if (order.tipoTarjeta === "Crédito" && order.cuotas) {
                    pago += " · " + order.cuotas +
                        (Number(order.cuotas) === 1 ? " cuota" : " cuotas") +
                        " sin interés";
                } else if (order.tipoTarjeta === "Débito") {
                    pago += " · Un pago";
                }

                datos.push(pago);
            }

            detail.textContent = datos.join(" · ");

            card.appendChild(title);
            card.appendChild(detail);
            ordersList.appendChild(card);
        });
    }

    if (!checkout) return;

    const steps = document.querySelectorAll(".checkout-step");
    const pills = document.querySelectorAll(".step-pill");
    const radios = document.querySelectorAll('input[name="sector"]');

    const earlyToggle = document.querySelector(".early-ticket-toggle");
    const earlyDetails = document.getElementById("early-ticket-details");

    if (earlyToggle && earlyDetails) {
        earlyToggle.addEventListener("click", function () {
            earlyDetails.hidden = !earlyDetails.hidden;
            earlyToggle.setAttribute("aria-expanded", String(!earlyDetails.hidden));
        });
    }

    const quantity = document.getElementById("ticket-quantity");
    const buyerForm = document.getElementById("buyer-form");
    const paymentForm = document.getElementById("payment-form");

    const tiposTarjeta = document.querySelectorAll('input[name="tipoTarjeta"]');
    const cuotasRadios = document.querySelectorAll('input[name="cuotas"]');
    const installmentsSection = document.getElementById("installments-section");
    const installmentsDetail = document.getElementById("installments-detail");
    const summaryPayment = document.getElementById("summary-payment");

    let pagoConfirmado = null;

    function selected() {
        return document.querySelector('input[name="sector"]:checked');
    }

    function selectedType() {
        const input = document.querySelector('input[name="tipoTarjeta"]:checked');
        return input ? input.value : "Crédito";
    }

    function selectedBrand() {
        const input = document.querySelector('input[name="metodo"]:checked');
        return input ? input.value : "Visa";
    }

    function selectedInstallments() {
        if (selectedType() === "Débito") return 1;

        const input = document.querySelector('input[name="cuotas"]:checked');
        return input ? Number(input.value) : 1;
    }

    function details() {
        const sector = selected();
        const precio = sector ? Number(sector.dataset.price) : 0;
        const cantidad = quantity ? Number(quantity.value) : 1;

        return {
            sector: sector ? sector.value : "",
            precio: precio,
            cantidad: cantidad,
            total: precio * cantidad
        };
    }

    function updatePayment() {
        const tipo = selectedType();
        const cuotas = selectedInstallments();
        const d = details();

        if (installmentsSection) {
            installmentsSection.hidden = tipo === "Débito";
        }

        if (installmentsDetail) {
            if (tipo === "Crédito") {
                const importe = d.total / cuotas;

                installmentsDetail.textContent =
                    cuotas === 1
                        ? "1 cuota de " + pesosCuotas.format(importe) + " sin interés"
                        : cuotas + " cuotas de " + pesosCuotas.format(importe) + " sin interés";
            } else {
                installmentsDetail.textContent = "";
            }
        }

        if (summaryPayment) {
            const pasoPago = document.querySelector('.checkout-step[data-step="3"]');
            const pasoConfirmacion = document.querySelector('.checkout-step[data-step="4"]');

            const pagoVisible = pasoPago && !pasoPago.hidden;
            const confirmacionVisible = pasoConfirmacion && !pasoConfirmacion.hidden;

            if (confirmacionVisible && pagoConfirmado) {
                summaryPayment.textContent = pagoConfirmado;
            } else if (pagoVisible) {
                summaryPayment.textContent =
                    tipo === "Débito"
                        ? "Débito · 1 pago"
                        : "Crédito · " + cuotas +
                          (cuotas === 1 ? " cuota" : " cuotas") +
                          " sin interés";
            } else {
                summaryPayment.textContent = "A seleccionar";
            }
        }
    }

    function updateSummary() {
        const d = details();

        const summarySector = document.getElementById("summary-sector");
        const summaryQuantity = document.getElementById("summary-quantity");
        const summaryPrice = document.getElementById("summary-price");
        const summaryTotal = document.getElementById("summary-total");

        if (summarySector) summarySector.textContent = d.sector;
        if (summaryQuantity) summaryQuantity.textContent = d.cantidad;
        if (summaryPrice) summaryPrice.textContent = pesos.format(d.precio);
        if (summaryTotal) summaryTotal.textContent = pesos.format(d.total);

        updatePayment();
    }

    function showStep(number) {
        steps.forEach(function (step) {
            const active = Number(step.dataset.step) === number;
            step.hidden = !active;
            step.classList.toggle("active", active);
        });

        pills.forEach(function (pill) {
            const active = Number(pill.dataset.stepLabel) === number;
            pill.classList.toggle("active", active);
        });

        updatePayment();

        const pasos = document.querySelector(".checkout-steps");

        if (pasos) {
            const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            pasos.scrollIntoView({
                behavior: reducirMovimiento ? "auto" : "smooth",
                block: "start"
            });
        }
    }

    radios.forEach(function (radio) {
        radio.addEventListener("change", updateSummary);
    });

    if (quantity) {
        quantity.addEventListener("change", updateSummary);
    }

    tiposTarjeta.forEach(function (radio) {
        radio.addEventListener("change", function () {
            if (selectedType() === "Débito") {
                const primeraCuota = document.querySelector('input[name="cuotas"][value="1"]');

                if (primeraCuota) {
                    primeraCuota.checked = true;
                }
            }

            updateSummary();
        });
    });

    cuotasRadios.forEach(function (radio) {
        radio.addEventListener("change", updateSummary);
    });

    document.querySelectorAll("[data-next]").forEach(function (button) {
        button.addEventListener("click", function () {
            showStep(Number(button.dataset.next));
        });
    });

    document.querySelectorAll("[data-back]").forEach(function (button) {
        button.addEventListener("click", function () {
            showStep(Number(button.dataset.back));
        });
    });

    if (buyerForm) {
        buyerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (buyerForm.reportValidity()) {
                showStep(3);
            }
        });
    }

    if (paymentForm) {
        paymentForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!paymentForm.reportValidity()) return;

            const d = details();
            const tipo = selectedType();
            const marca = selectedBrand();
            const cuotas = selectedInstallments();

            pagoConfirmado =
                tipo === "Débito"
                    ? "Débito · 1 pago"
                    : "Crédito · " + cuotas +
                      (cuotas === 1 ? " cuota" : " cuotas") +
                      " sin interés";

            const order = {
                id: "SC-" + Date.now().toString().slice(-7),
                fecha: new Date().toLocaleDateString("es-AR"),
                sector: d.sector,
                cantidad: d.cantidad,
                total: d.total,
                tipoTarjeta: tipo,
                marcaTarjeta: marca,
                cuotas: cuotas
            };

            try {
                const orders = readOrders();
                orders.push(order);
                localStorage.setItem(storageKey, JSON.stringify(orders));
            } catch (error) {
                alert("No se pudo guardar el pedido en este navegador.");
                return;
            }

            const result = document.getElementById("confirmation-details");

            if (result) {
                result.replaceChildren();

                const lines = [
                    "PEDIDO: " + order.id,
                    "EVENTO: SABRINA CARPENTER · 10/12/2026",
                    "SECTOR: " + order.sector,
                    "ENTRADAS: " + order.cantidad,
                    "TOTAL: " + pesos.format(order.total),
                    "MEDIO DE PAGO: " + tipo + " " + marca
                ];

                if (tipo === "Crédito") {
                    lines.push(
                        "CUOTAS: " + cuotas +
                        (cuotas === 1 ? " cuota" : " cuotas") +
                        " sin interés de " + pesosCuotas.format(d.total / cuotas)
                    );
                } else {
                    lines.push("PAGO: Un solo pago");
                }

                lines.forEach(function (line) {
                    const paragraph = document.createElement("div");
                    paragraph.textContent = line;
                    result.appendChild(paragraph);
                });
            }

            paymentForm.reset();
            showStep(4);
        });
    }

    const newOrder = document.getElementById("new-order");

    if (newOrder) {
        newOrder.addEventListener("click", function () {
            pagoConfirmado = null;

            if (buyerForm) buyerForm.reset();
            if (paymentForm) paymentForm.reset();

            if (quantity) quantity.value = "1";

            if (radios.length > 0) {
                radios[0].checked = true;
            }

            updateSummary();
            showStep(1);
        });
    }

    updateSummary();
});





