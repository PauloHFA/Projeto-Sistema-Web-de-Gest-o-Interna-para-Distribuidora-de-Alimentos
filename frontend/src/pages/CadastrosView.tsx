import React, { useState, useEffect } from 'react';
import {
  Users,
  Building,
  Package,
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { ERPStore } from '../services/store';

export const CadastrosView: React.FC = () => {
  const [state, setState] = useState(ERPStore.getState());
  const [tab, setTab] = useState<'clientes' | 'fornecedores' | 'produtos'>('clientes');
  const [busca, setBusca] = useState('');

  // Modais
  const [modalCliente, setModalCliente] = useState(false);
  const [modalProduto, setModalProduto] = useState(false);

  // Form Cliente
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [limiteCredito, setLimiteCredito] = useState('10000');
  const [vendedor] = useState('Carlos Souza');

  // Form Produto
  const [sku, setSku] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Mercearia Básica');
  const [unidade, setUnidade] = useState<'UN' | 'CX' | 'KG' | 'FD' | 'LT'>('CX');
  const [precoVenda, setPrecoVenda] = useState('');
  const [custoMedio, setCustoMedio] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('20');

  useEffect(() => {
    return ERPStore.subscribe(() => {
      setState({ ...ERPStore.getState() });
    });
  }, []);

  const handleSalvarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!razaoSocial || !documento) return;

    ERPStore.adicionarCliente({
      razaoSocial,
      nomeFantasia,
      documento,
      email,
      telefone,
      limiteCredito: Number(limiteCredito) || 0,
      vendedor,
    });

    setModalCliente(false);
    setRazaoSocial('');
    setNomeFantasia('');
    setDocumento('');
    setEmail('');
    setTelefone('');
  };

  const handleSalvarProduto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !descricao) return;

    ERPStore.adicionarProduto({
      sku: sku.toUpperCase(),
      descricao,
      categoria,
      unidade,
      precoVenda: Number(precoVenda) || 0,
      custoMedio: Number(custoMedio) || 0,
      estoqueMinimo: Number(estoqueMinimo) || 0,
    });

    setModalProduto(false);
    setSku('');
    setDescricao('');
    setPrecoVenda('');
    setCustoMedio('');
  };

  const clientesFiltrados = state.clientes.filter(c =>
    c.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
    c.documento.includes(busca)
  );

  const fornecedoresFiltrados = state.fornecedores.filter(f =>
    f.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
    f.documento.includes(busca)
  );

  const produtosFiltrados = state.produtos.filter(p =>
    p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    p.sku.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Cadastros Operacionais</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão unificada de clientes, fornecedores parceiros e catálogo de mercadorias.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {tab === 'clientes' && (
            <button
              onClick={() => setModalCliente(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition"
            >
              <PlusCircle className="w-4 h-4" /> Novo Cliente
            </button>
          )}
          {tab === 'produtos' && (
            <button
              onClick={() => setModalProduto(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition"
            >
              <PlusCircle className="w-4 h-4" /> Novo Produto
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 gap-6">
        <button
          onClick={() => setTab('clientes')}
          className={`pb-3.5 text-xs font-bold transition-all ${
            tab === 'clientes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Clientes ({state.clientes.length})
        </button>
        <button
          onClick={() => setTab('fornecedores')}
          className={`pb-3.5 text-xs font-bold transition-all ${
            tab === 'fornecedores' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Fornecedores ({state.fornecedores.length})
        </button>
        <button
          onClick={() => setTab('produtos')}
          className={`pb-3.5 text-xs font-bold transition-all ${
            tab === 'produtos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Produtos e Alimentos ({state.produtos.length})
        </button>
      </div>

      {/* Campo de Busca */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={`Buscar em ${tab}...`}
          className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
      </div>

      {/* TABELA: CLIENTES */}
      {tab === 'clientes' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
                <tr>
                  <th className="py-3.5 px-6">Razão Social / Nome Fantasia</th>
                  <th className="py-3.5 px-6">CNPJ / CPF</th>
                  <th className="py-3.5 px-6">Contato</th>
                  <th className="py-3.5 px-6 text-right">Limite de Crédito</th>
                  <th className="py-3.5 px-6">Vendedor</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientesFiltrados.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{c.razaoSocial}</p>
                      <p className="text-[11px] text-slate-400">{c.nomeFantasia}</p>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600 font-medium">{c.documento}</td>
                    <td className="py-4 px-6">
                      <p className="text-slate-800 font-medium">{c.email}</p>
                      <p className="text-slate-400 font-mono text-[11px]">{c.telefone}</p>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900 font-mono">
                      {c.limiteCredito.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">{c.vendedor}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ativo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABELA: FORNECEDORES */}
      {tab === 'fornecedores' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
                <tr>
                  <th className="py-3.5 px-6">Razão Social / Nome Fantasia</th>
                  <th className="py-3.5 px-6">CNPJ</th>
                  <th className="py-3.5 px-6">Contato</th>
                  <th className="py-3.5 px-6">Prazo Padrão</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fornecedoresFiltrados.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{f.razaoSocial}</p>
                      <p className="text-[11px] text-slate-400">{f.nomeFantasia}</p>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600 font-medium">{f.documento}</td>
                    <td className="py-4 px-6">
                      <p className="text-slate-800 font-medium">{f.email}</p>
                      <p className="text-slate-400 font-mono text-[11px]">{f.telefone}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">{f.prazoPagamento}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Homologado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABELA: PRODUTOS */}
      {tab === 'produtos' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
                <tr>
                  <th className="py-3.5 px-6">SKU</th>
                  <th className="py-3.5 px-6">Descrição</th>
                  <th className="py-3.5 px-6">Categoria</th>
                  <th className="py-3.5 px-6 text-center">Unidade</th>
                  <th className="py-3.5 px-6 text-right">Preço Venda</th>
                  <th className="py-3.5 px-6 text-right">Custo Médio</th>
                  <th className="py-3.5 px-6 text-center">Estoque Mínimo</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {produtosFiltrados.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">{p.sku}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{p.descricao}</td>
                    <td className="py-4 px-6 text-slate-500">{p.categoria}</td>
                    <td className="py-4 px-6 text-center font-mono font-bold">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">{p.unidade}</span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900 font-mono">
                      {p.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-4 px-6 text-right text-slate-600 font-mono">
                      {p.custoMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 font-mono">{p.estoqueMinimo}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                        p.ativo ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.ativo ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {p.ativo ? 'Ativo' : 'Inativo (Soft-Delete)'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => ERPStore.alternarStatusProduto(p.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold transition"
                      >
                        {p.ativo ? 'Inativar' : 'Reativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL NOVO CLIENTE */}
      {modalCliente && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4">Cadastrar Novo Cliente</h3>
            <form onSubmit={handleSalvarCliente} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Razão Social</label>
                <input
                  type="text"
                  required
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CNPJ / CPF</label>
                  <input
                    type="text"
                    required
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Limite de Crédito (R$)</label>
                  <input
                    type="number"
                    value={limiteCredito}
                    onChange={(e) => setLimiteCredito(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalCliente(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO PRODUTO */}
      {modalProduto && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4">Cadastrar Novo Produto (Alimento)</h3>
            <form onSubmit={handleSalvarProduto} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Código / SKU</label>
                  <input
                    type="text"
                    required
                    placeholder="ALIM-0000"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Comercial</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Arroz Agulhinha 5kg Cx c/ 6"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Mercearia Básica">Mercearia Básica</option>
                    <option value="Grãos e Cereais">Grãos e Cereais</option>
                    <option value="Laticínios">Laticínios</option>
                    <option value="Massas e Farinhas">Massas e Farinhas</option>
                    <option value="Conservas e Molhos">Conservas e Molhos</option>
                    <option value="Matinais">Matinais</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unidade</label>
                  <select
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="CX">CX (Caixa)</option>
                    <option value="FD">FD (Fardo)</option>
                    <option value="KG">KG (Quilograma)</option>
                    <option value="UN">UN (Unidade)</option>
                    <option value="LT">LT (Litro)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preço Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={precoVenda}
                    onChange={(e) => setPrecoVenda(e.target.value)}
                    placeholder="0,00"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custo Médio (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={custoMedio}
                    onChange={(e) => setCustoMedio(e.target.value)}
                    placeholder="0,00"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={estoqueMinimo}
                    onChange={(e) => setEstoqueMinimo(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalProduto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
