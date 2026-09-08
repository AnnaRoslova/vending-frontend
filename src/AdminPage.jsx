import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

function AdminPage() {
    const [searchParams] = useSearchParams()
    const key = searchParams.get('key') || ''

    const [coins, setCoins] = useState([])
    const [drinks, setDrinks] = useState([])
    const [error, setError] = useState('')

    const [newDrink, setNewDrink] = useState({ name: '', price: '', count: '', imageUrl: '' })

    const [importText, setImportText] = useState('')
    const [importMessage, setImportMessage] = useState('')

    useEffect(() => {
        loadCoins()
        loadDrinks()
    }, [])

    function loadCoins() {
        fetch(`/api/admin/coins?key=${key}`)
            .then((res) => {
                if (!res.ok) throw new Error('Нет доступа — проверь ключ в адресной строке')
                return res.json()
            })
            .then((data) => setCoins(data))
            .catch((err) => setError(err.message))
    }

    function loadDrinks() {
        fetch(`/api/admin/drinks?key=${key}`)
            .then((res) => {
                if (!res.ok) throw new Error('Нет доступа — проверь ключ в адресной строке')
                return res.json()
            })
            .then((data) => setDrinks(data))
            .catch((err) => setError(err.message))
    }

    function setCoinCount(denomination, count) {
        fetch(`/api/admin/coins/${denomination}/count?key=${key}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count: Number(count) }),
        }).then(() => loadCoins())
    }

    function setCoinBlocked(denomination, isBlocked) {
        fetch(`/api/admin/coins/${denomination}/blocked?key=${key}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isBlocked }),
        }).then(() => loadCoins())
    }

    function addDrink(e) {
        e.preventDefault()
        fetch(`/api/admin/drinks?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newDrink.name,
                price: Number(newDrink.price),
                count: Number(newDrink.count),
                imageUrl: newDrink.imageUrl,
            }),
        }).then(() => {
            setNewDrink({ name: '', price: '', count: '', imageUrl: '' })
            loadDrinks()
        })
    }

    function updateDrink(drink, field, value) {
        const updated = { ...drink, [field]: value }
        fetch(`/api/admin/drinks/${drink.id}?key=${key}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: updated.name,
                price: Number(updated.price),
                count: Number(updated.count),
                imageUrl: updated.imageUrl,
            }),
        }).then(() => loadDrinks())
    }

    function removeDrink(id) {
        fetch(`/api/admin/drinks/${id}?key=${key}`, { method: 'DELETE' }).then(() => loadDrinks())
    }

    function importDrinks() {
        let parsed
        try {
            parsed = JSON.parse(importText)
        } catch {
            setImportMessage('Неверный формат JSON')
            return
        }

        fetch(`/api/admin/drinks/import?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed),
        })
            .then((res) => res.json())
            .then((data) => {
                setImportMessage(`Импортировано напитков: ${data.imported}`)
                setImportText('')
                loadDrinks()
            })
    }

    if (error) {
        return <div style={{ padding: 20, fontFamily: 'sans-serif' }}><h1>{error}</h1></div>
    }

    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
            <h1>Админка автомата</h1>

            <h2>Монеты</h2>
            <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Номинал</th>
                        <th>Количество</th>
                        <th>Заблокирована</th>
                    </tr>
                </thead>
                <tbody>
                    {coins.map((coin) => (
                        <tr key={coin.denomination}>
                            <td>{coin.denomination} руб</td>
                            <td>
                                <input
                                    type="number"
                                    defaultValue={coin.count}
                                    onBlur={(e) => setCoinCount(coin.denomination, e.target.value)}
                                    style={{ width: 60 }}
                                />
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={coin.isBlocked}
                                    onChange={(e) => setCoinBlocked(coin.denomination, e.target.checked)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Напитки</h2>
            <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Цена</th>
                        <th>Количество</th>
                        <th>Картинка (URL)</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {drinks.map((drink) => (
                        <tr key={drink.id}>
                            <td>
                                <input
                                    defaultValue={drink.name}
                                    onBlur={(e) => updateDrink(drink, 'name', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    defaultValue={drink.price}
                                    onBlur={(e) => updateDrink(drink, 'price', e.target.value)}
                                    style={{ width: 70 }}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    defaultValue={drink.count}
                                    onBlur={(e) => updateDrink(drink, 'count', e.target.value)}
                                    style={{ width: 60 }}
                                />
                            </td>
                            <td>
                                <input
                                    defaultValue={drink.imageUrl}
                                    onBlur={(e) => updateDrink(drink, 'imageUrl', e.target.value)}
                                    style={{ width: 200 }}
                                />
                            </td>
                            <td>
                                <button onClick={() => removeDrink(drink.id)}>Удалить</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>Добавить напиток</h3>
            <form onSubmit={addDrink}>
                <input
                    placeholder="Название"
                    value={newDrink.name}
                    onChange={(e) => setNewDrink({ ...newDrink, name: e.target.value })}
                    required
                />{' '}
                <input
                    placeholder="Цена"
                    type="number"
                    value={newDrink.price}
                    onChange={(e) => setNewDrink({ ...newDrink, price: e.target.value })}
                    required
                />{' '}
                <input
                    placeholder="Количество"
                    type="number"
                    value={newDrink.count}
                    onChange={(e) => setNewDrink({ ...newDrink, count: e.target.value })}
                    required
                />{' '}
                <input
                    placeholder="URL картинки"
                    value={newDrink.imageUrl}
                    onChange={(e) => setNewDrink({ ...newDrink, imageUrl: e.target.value })}
                    required
                />{' '}
                <button type="submit">Добавить</button>
            </form>

            <h3>Импорт напитков (JSON)</h3>
            <p style={{ fontSize: 12, color: '#888' }}>
                Формат: [{'{'}"name":"Спрайт","price":25,"count":10,"imageUrl":"..."{'}'}]
            </p>
            <textarea
                rows="4"
                style={{ width: 500 }}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='[{"name":"Спрайт","price":25,"count":10,"imageUrl":"https://..."}]'
            />
            <br />
            <button onClick={importDrinks}>Импортировать</button>
            {importMessage && <p>{importMessage}</p>}
        </div>
    )
}

export default AdminPage