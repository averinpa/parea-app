Экран 1: Home (Feed)

Header: Слева — селектор города "Limassol" с иконкой стрелочки вниз, справа — иконка уведомлений (колокольчик).

Filters: Горизонтальный скролл чипсов (Everything, Big Events, Social, Music).

Event Cards:

Реализуй через FlatList. Карточки с яркими градиентами (фиолетовый, розовый, темно-бирюзовый).

Бейдж "Official" в левом верхнем углу. Круглая иконка категории — в правом верхнем.

Блок социальной активности: стек из 3-х аватарок + текст "X people looking for company".

Кнопка "Join" должна быть аккуратной, полупрозрачной или с эффектом стекла.
«Клод, добавь логику для экрана Home:

Data Matching: Синхронизируй ленту с массивом userInterests (из Step 3). События с совпадающими тегами должны быть в топе.

Filter Logic: Реализуй функцию фильтрации для верхней панели категорий (All, Events, Social...).

Join Flow: Напиши функцию handleJoinEvent. При клике статус меняется на "Pending/Joined", а событие сохраняется в профиль пользователя.

Dynamic Data: Используй моковые данные (JSON), где у каждого ивента есть: ID, category, title, time, distance, participantsCount, maxParticipants, isOfficial.

Real-time Status: Если participantsCount == maxParticipants, кнопка Join меняется на "Full" и становится неактивной».
Промт для Claude: Official Events & Ticket Links
«Клод, давай добавим в бизнес-логику разделение на User Events и Official Events.

Для Official Events (концерты, фестивали):

Organizer Block: Вместо личного профиля отображай карточку организации: Logo, Title (например, "SoldOut Tickets" или "Coca-Cola Arena") и бейдж "Verified Source".

External Link: Добавь поле ticketLink. Если оно заполнено, на экране ивента должна появиться вторая кнопка: "Get Tickets 🎫". При клике — открывай ссылку во встроенном браузере.

The "Join" Logic: Для таких ивентов кнопка "Join" должна называться "I'm Going" или "Find Buddies". Логика остается той же: юзер добавляется в общий чат этого ивента, чтобы найти компанию.

Data Source: Добавь в объект ивента поле source (например, "Source: Official Website"), чтобы юзер понимал, откуда инфа.

Стиль: Кнопка покупки билета должна быть чуть менее яркой, чем основная "Join", чтобы не перебивать главный флоу приложения, но оставаться заметной (например, контурная или другого цвета)».
