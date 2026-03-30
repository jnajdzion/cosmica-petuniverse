// Página de agendamento: validações, máscaras e confirmação com verificação temporal.

document.getElementById("anoAtual").textContent = new Date().getFullYear();

const cpfInput = document.getElementById("cpf");
const telefoneInput = document.getElementById("telefone");
const dataAgendamento = document.getElementById("dataAgendamento");
const horaAgendamento = document.getElementById("horaAgendamento");
const form = document.getElementById("formAgendamentoCompleto");
const mensagem = document.getElementById("mensagemAgendamento");
const btn = document.getElementById("btnAgendamento");

const agora = new Date();
const hoje = agora.toISOString().split("T")[0];
const horaAtual = agora.toTimeString().slice(0, 5);

dataAgendamento.min = hoje;
dataAgendamento.value = hoje;

const horariosOcupados = [
    "2026-03-30 10:00",
    "2026-03-30 14:00",
    "2026-03-31 09:30",
    "2026-03-31 15:00",
    "2026-04-01 11:00"
];

function aplicarMascaraCPF(valor) {
    return valor
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        .slice(0, 14);
}

function aplicarMascaraTelefone(valor) {
    valor = valor.replace(/\D/g, "").slice(0, 11);
    if (valor.length <= 10) {
        return valor
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return valor
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
}

function cpfValido(cpf) {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10), 10)) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.substring(10, 11), 10);
}

function marcarCampo(input, valido) {
    input.classList.remove("campo-erro", "campo-sucesso");
    if (input.value.trim() === "") return;
    input.classList.add(valido ? "campo-sucesso" : "campo-erro");
}

function validarHorarioComercial(hora) {
    return hora >= "09:00" && hora <= "18:00";
}

function horarioFuturo(data, hora) {
    if (!data || !hora) return false;
    if (data > hoje) return true;
    if (data < hoje) return false;
    return hora > horaAtual;
}

function horarioDisponivel(data, hora) {
    return !horariosOcupados.includes(`${data} ${hora}`);
}

cpfInput.addEventListener("input", () => cpfInput.value = aplicarMascaraCPF(cpfInput.value));
telefoneInput.addEventListener("input", () => telefoneInput.value = aplicarMascaraTelefone(telefoneInput.value));

cpfInput.addEventListener("blur", () => marcarCampo(cpfInput, cpfValido(cpfInput.value)));
telefoneInput.addEventListener("blur", () => marcarCampo(telefoneInput, telefoneInput.value.replace(/\D/g, "").length >= 10));
document.getElementById("email").addEventListener("blur", (e) => marcarCampo(e.target, e.target.checkValidity()));
document.getElementById("nomeCliente").addEventListener("blur", (e) => marcarCampo(e.target, e.target.value.trim().length >= 3));
document.getElementById("endereco").addEventListener("blur", (e) => marcarCampo(e.target, e.target.value.trim().length >= 5));
document.getElementById("nomePet").addEventListener("blur", (e) => marcarCampo(e.target, e.target.value.trim().length >= 2));
document.getElementById("racaPet").addEventListener("blur", (e) => marcarCampo(e.target, e.target.value.trim().length >= 2));
document.getElementById("idadePet").addEventListener("blur", (e) => marcarCampo(e.target, e.target.value !== ""));
document.getElementById("servico").addEventListener("blur", (e) => marcarCampo(e.target, e.target.value !== ""));

horaAgendamento.addEventListener("blur", () => {
    const valido = validarHorarioComercial(horaAgendamento.value) &&
        horarioFuturo(dataAgendamento.value, horaAgendamento.value) &&
        horarioDisponivel(dataAgendamento.value, horaAgendamento.value);
    marcarCampo(horaAgendamento, valido);
});

dataAgendamento.addEventListener("blur", () => {
    const valido = !!dataAgendamento.value;
    marcarCampo(dataAgendamento, valido);
});

function mostrarMensagem(tipo, texto) {
    mensagem.className = `alert alert-${tipo} mt-4`;
    mensagem.innerHTML = texto;
}

function mostrarBotaoCarregando() {
    btn.dataset.original = btn.textContent;
    btn.textContent = "Confirmando...";
    btn.disabled = true;
    btn.classList.add("btn-loading");
}

function restaurarBotao() {
    btn.textContent = btn.dataset.original || "Confirmar agendamento";
    btn.disabled = false;
    btn.classList.remove("btn-loading");
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const cpfOk = cpfValido(cpfInput.value);
    const horarioOk = validarHorarioComercial(horaAgendamento.value);
    const futuroOk = horarioFuturo(dataAgendamento.value, horaAgendamento.value);
    const disponibilidadeOk = horarioDisponivel(dataAgendamento.value, horaAgendamento.value);

    marcarCampo(cpfInput, cpfOk);
    marcarCampo(horaAgendamento, horarioOk && futuroOk && disponibilidadeOk);
    marcarCampo(dataAgendamento, !!dataAgendamento.value && futuroOk && disponibilidadeOk);

    if (!form.checkValidity() || !cpfOk || !horarioOk || !futuroOk || !disponibilidadeOk) {
        form.classList.add("was-validated");

        if (!cpfOk) {
            mostrarMensagem("danger", "<strong>CPF inválido.</strong><br>Revise os números informados.");
            return;
        }
        if (!horarioOk) {
            mostrarMensagem("danger", "<strong>Horário inválido.</strong><br>Escolha um horário entre 09:00 e 18:00.");
            return;
        }
        if (!futuroOk) {
            mostrarMensagem("warning", "<strong>Horário indisponível para hoje.</strong><br>Escolha um horário futuro em relação ao momento atual do sistema.");
            return;
        }
        if (!disponibilidadeOk) {
            mostrarMensagem("warning", "<strong>Horário indisponível.</strong><br>Esse horário já está reservado. Por favor, escolha outro horário.");
            return;
        }
        mostrarMensagem("danger", "<strong>Formulário incompleto.</strong><br>Preencha todos os campos obrigatórios.");
        return;
    }

    mostrarBotaoCarregando();

    setTimeout(() => {
        const nomeCliente = document.getElementById("nomeCliente").value;
        const nomePet = document.getElementById("nomePet").value;
        const servico = document.getElementById("servico").value;
        const data = dataAgendamento.value;
        const hora = horaAgendamento.value;

        mostrarMensagem("success", `<strong>Agendamento confirmado com sucesso!</strong><br>
        Cliente: ${nomeCliente}<br>
        Pet: ${nomePet}<br>
        Serviço: ${servico}<br>
        Data: ${data}<br>
        Horário: ${hora}`);

        form.reset();
        dataAgendamento.value = hoje;
        form.classList.remove("was-validated");
        document.querySelectorAll(".campo-erro, .campo-sucesso").forEach((campo) => {
            campo.classList.remove("campo-erro", "campo-sucesso");
        });

        restaurarBotao();
    }, 700);
});
