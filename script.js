// Arquivo JavaScript da fase 2 otimizada
// Objetivo: adicionar dinamismo, feedback visual e melhor experiência para a pessoa usuária,
// usando funções temporais principalmente para orientar o agendamento.

// ---------- Data atual e configurações temporais ----------
document.getElementById("anoAtual").textContent = new Date().getFullYear();

const cpfInput = document.getElementById("cpf");
const telefoneInput = document.getElementById("telefone");
const dataAgendamento = document.getElementById("dataAgendamento");
const horaAgendamento = document.getElementById("horaAgendamento");

// Usa a data atual do sistema para orientar o calendário do agendamento.
const agora = new Date();
const hoje = agora.toISOString().split("T")[0];
const horaAtual = agora.toTimeString().slice(0, 5);

dataAgendamento.min = hoje;
dataAgendamento.value = hoje;

// ---------- Máscaras simples ----------
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

cpfInput.addEventListener("input", () => {
    cpfInput.value = aplicarMascaraCPF(cpfInput.value);
});

telefoneInput.addEventListener("input", () => {
    telefoneInput.value = aplicarMascaraTelefone(telefoneInput.value);
});

// ---------- Validação de CPF ----------
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
    if (resto !== parseInt(cpf.substring(10, 11), 10)) return false;

    return true;
}

// ---------- Feedback visual ----------
function marcarCampo(input, valido) {
    input.classList.remove("campo-erro", "campo-sucesso");
    if (input.value.trim() === "") return;
    input.classList.add(valido ? "campo-sucesso" : "campo-erro");
}

function validarHorarioComercial(hora) {
    if (!hora) return false;
    return hora >= "09:00" && hora <= "18:00";
}

function horarioFuturo(data, hora) {
    if (!data || !hora) return false;
    if (data > hoje) return true;
    if (data < hoje) return false;
    return hora > horaAtual;
}

function mostrarBotaoCarregando(botao, textoOriginal, textoCarregando) {
    botao.dataset.textoOriginal = textoOriginal;
    botao.textContent = textoCarregando;
    botao.classList.add("btn-loading");
    botao.disabled = true;
}

function restaurarBotao(botao) {
    botao.textContent = botao.dataset.textoOriginal || botao.textContent;
    botao.classList.remove("btn-loading");
    botao.disabled = false;
}

// ---------- Validação em tempo real ----------
cpfInput.addEventListener("blur", () => marcarCampo(cpfInput, cpfValido(cpfInput.value)));
telefoneInput.addEventListener("blur", () => marcarCampo(telefoneInput, telefoneInput.value.replace(/\D/g, "").length >= 10));
document.getElementById("email").addEventListener("blur", (e) => marcarCampo(e.target, e.target.checkValidity()));
document.getElementById("nomeCliente").addEventListener("blur", (e) => marcarCampo(e.target, e.target.value.trim().length >= 3));
document.getElementById("nomePet").addEventListener("blur", (e) => marcarCampo(e.target, e.target.value.trim().length >= 2));
document.getElementById("racaPet").addEventListener("blur", (e) => marcarCampo(e.target, e.target.value.trim().length >= 2));
document.getElementById("idadePet").addEventListener("blur", (e) => marcarCampo(e.target, e.target.value !== ""));
horaAgendamento.addEventListener("blur", () => {
    const valido = validarHorarioComercial(horaAgendamento.value) && horarioFuturo(dataAgendamento.value, horaAgendamento.value);
    marcarCampo(horaAgendamento, valido);
});
dataAgendamento.addEventListener("blur", () => {
    const valido = !!dataAgendamento.value;
    marcarCampo(dataAgendamento, valido);
});

// ---------- Formulário de cadastro ----------
const formCadastro = document.getElementById("formCadastro");
const mensagemCadastro = document.getElementById("mensagemCadastro");
const btnCadastro = document.getElementById("btnCadastro");

formCadastro.addEventListener("submit", function (event) {
    event.preventDefault();

    const cpfOk = cpfValido(cpfInput.value);
    marcarCampo(cpfInput, cpfOk);

    if (!formCadastro.checkValidity() || !cpfOk) {
        formCadastro.classList.add("was-validated");
        if (!cpfOk) {
            mensagemCadastro.textContent = "Não foi possível salvar: informe um CPF válido.";
            mensagemCadastro.className = "alert alert-danger mt-4";
        }
        return;
    }

    mostrarBotaoCarregando(btnCadastro, "Salvar cadastro", "Salvando...");

    setTimeout(() => {
        const nomeCliente = document.getElementById("nomeCliente").value;
        const nomePet = document.getElementById("nomePet").value;

        mensagemCadastro.textContent = `Cadastro salvo com sucesso! Cliente: ${nomeCliente} | Pet: ${nomePet}.`;
        mensagemCadastro.className = "alert alert-success mt-4";
        formCadastro.reset();
        formCadastro.classList.remove("was-validated");

        document.querySelectorAll("#formCadastro .campo-erro, #formCadastro .campo-sucesso").forEach((campo) => {
            campo.classList.remove("campo-erro", "campo-sucesso");
        });

        restaurarBotao(btnCadastro);
    }, 700);
});

// ---------- Simulação de disponibilidade ----------
const horariosOcupados = [
    "2026-03-30 10:00",
    "2026-03-30 14:00",
    "2026-03-31 09:30",
    "2026-03-31 15:00",
    "2026-04-01 11:00"
];

function horarioDisponivel(data, hora) {
    const dataHora = `${data} ${hora}`;
    return !horariosOcupados.includes(dataHora);
}

// ---------- Formulário de agendamento ----------
const formAgendamento = document.getElementById("formAgendamento");
const resumoAgendamento = document.getElementById("resumoAgendamento");
const btnAgendamento = document.getElementById("btnAgendamento");

formAgendamento.addEventListener("submit", function (event) {
    event.preventDefault();

    const horarioOk = validarHorarioComercial(horaAgendamento.value);
    const futuroOk = horarioFuturo(dataAgendamento.value, horaAgendamento.value);
    const disponibilidadeOk = horarioDisponivel(dataAgendamento.value, horaAgendamento.value);

    marcarCampo(horaAgendamento, horarioOk && futuroOk && disponibilidadeOk);
    marcarCampo(dataAgendamento, !!dataAgendamento.value && futuroOk && disponibilidadeOk);

    if (!formAgendamento.checkValidity() || !horarioOk || !futuroOk || !disponibilidadeOk) {
        formAgendamento.classList.add("was-validated");

        if (!horarioOk) {
            resumoAgendamento.innerHTML = "<strong>Horário inválido.</strong><br>Escolha um horário entre 09:00 e 18:00.";
            resumoAgendamento.className = "alert alert-danger mt-4";
            return;
        }

        if (!futuroOk) {
            resumoAgendamento.innerHTML = "<strong>Horário indisponível para hoje.</strong><br>Escolha um horário futuro em relação ao momento atual do sistema.";
            resumoAgendamento.className = "alert alert-warning mt-4";
            return;
        }

        if (!disponibilidadeOk) {
            resumoAgendamento.innerHTML = "<strong>Horário indisponível.</strong><br>Esse horário já está reservado. Por favor, escolha outro horário.";
            resumoAgendamento.className = "alert alert-warning mt-4";
            return;
        }

        return;
    }

    mostrarBotaoCarregando(btnAgendamento, "Confirmar agendamento", "Confirmando...");

    setTimeout(() => {
        const servico = document.getElementById("servico").value;
        const metodo = document.querySelector('input[name="metodoAgendamento"]:checked').value;
        const data = document.getElementById("dataAgendamento").value;
        const hora = document.getElementById("horaAgendamento").value;

        resumoAgendamento.innerHTML = `<strong>Agendamento confirmado!</strong><br>
        Serviço: ${servico}<br>
        Método: ${metodo}<br>
        Data: ${data}<br>
        Horário: ${hora}`;

        resumoAgendamento.className = "alert alert-info mt-4";
        restaurarBotao(btnAgendamento);
    }, 700);
});
