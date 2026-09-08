import { useState, useEffect } from 'react'

function UserPage() {
    const [coins, setCoins] = useState([])
    const [drinks, setDrinks] = useState([])
    const [amount, setAmount] = useState(0)
    const [message, setMessage] = useState('')

    useEffect(() => {
        loadCoins()
        loadDrinks()
        loadAmount()
    }, [])

    function loadCoins() {
        fetch('/api/user/coins')
            .then((res) => res.json())
            .then((data) => setCoins(data))
    }

    function loadDrinks() {
        fetch('/api/user/drinks')
            .then((res) => res.json())
            .then((data) => setDrinks(data))
    }

    function loadAmount() {
        fetch('/api/user/amount')
            .then((res) => res.json())
            .then((data) => setAmount(data.amount))
    }

    function insertCoin(denomination) {
        fetch('/api/user/insert-coin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ denomination }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.amount !== undefined) {
                    setAmount(data.amount)
                    setMessage('')
                } else {
                    setMessage(data.message || 'Ошибка')
                }
                loadCoins()
            })
    }

    function buyDrink(drinkId) {
        fetch('/api/user/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ drinkId }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.change !== undefined) {
                    const changeText = Object.entries(data.change)
                        .map(([denom, count]) => `${count} x ${denom}р`)
                        .join(', ')
                    setMessage(changeText ? `Ваша сдача: ${changeText}` : 'Сдачи нет')
                    setAmount(0)
                } else {
                    setMessage(data.message || 'Ошибка')
                }
                loadDrinks()
            })
    }

    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
            <h1>Автомат по продаже напитков</h1>

            <h2>Внести монеты</h2>
            <div>
                {coins.map((coin) => (
                    <button
                        key={coin.denomination}
                        disabled={coin.isBlocked}
                        onClick={() => insertCoin(coin.denomination)}
                        style={{
                            marginRight: 8,
                            padding: '8px 16px',
                            backgroundColor: coin.isBlocked ? '#ccc' : '#fff',
                            color: '#000',
                            cursor: coin.isBlocked ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {coin.denomination} руб
                    </button>
                ))}
            </div>

            <p>Внесённая сумма: <b>{amount} руб</b></p>

            <h2>Напитки</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {drinks.map((drink) => (
                    <div
                        key={drink.id}
                        style={{ border: '1px solid #ccc', padding: 10, width: 150, color: '#000', backgroundColor: '#fff' }}
                    >
                        <img
                            src={drink.imageUrl}
                            alt={drink.name}
                            style={{ width: '100%', height: 100, objectFit: 'cover' }}
                        />
                        <p>{drink.name}</p>
                        <p>{drink.price} руб</p>
                        <p>Осталось: {drink.count}</p>
                        <button
                            disabled={drink.count <= 0 || amount < drink.price}
                            onClick={() => buyDrink(drink.id)}
                        >
                            Купить
                        </button>
                    </div>
                ))}
            </div>

            {message && (
                <p style={{ marginTop: 20, fontWeight: 'bold' }}>{message}</p>
            )}
        </div>
    )
}

export default UserPage