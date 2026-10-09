import {z} from 'zod';

const InvitedContentSchema = z.object({
  type: z.enum(['video', 'podcast', 'article']),
  titleLanguage: z.enum(['en', 'ru']),
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.url(),
  publishedAt: z.date(),
});

// Title language marks available title text; do not infer a translation from the description.
export const invitedContent = InvitedContentSchema.array().parse([
  {
    type: 'video',
    titleLanguage: 'en',
    title: 'State Management Talks · TverIO',
    description:
      'Зачем нужны стейт-менеджеры на фронтенде, что за стейт хранится в них и где место бизнес- и не только логике, разберем на Tver.io.',
    url: 'https://www.youtube.com/watch?v=cUSyJk6k2rk',
    publishedAt: new Date('2020-07-23T15:30:00Z'),
  },
  {
    type: 'video',
    titleLanguage: 'ru',
    title: 'Интеллектуальное шоу про frontend · SECON',
    description:
      'Сергей Сова участвует в effector core team, занимается развитием экосистемы. Делится опытом проектирования фронтенда в feature-sliced core team. Дмитрий Карловский большой любитель реактивности, виртуализации, распределённых систем, логики и, конечно, скоростных велосипедов.',
    url: 'https://www.youtube.com/watch?v=NhPjUO6trGY',
    publishedAt: new Date('2021-10-08T20:00:00Z'),
  },
  {
    type: 'podcast',
    titleLanguage: 'ru',
    title: 'Пятиминутка React — Effector',
    description:
      'В этом выпуске Сергей Сова расскажет про библиотеку управления состоянием Effector, плюсы, основные фишки и удобства, статус проекта, личный опыт использования.',
    url: 'https://soundcloud.com/5minreact/063-effector',
    publishedAt: new Date('2019-12-23T12:30:00Z'),
  },
  {
    type: 'podcast',
    titleLanguage: 'ru',
    title: 'Дизайн-системы и ui-киты · SPb Frontend',
    description:
      'Что такое дизайн-система, и как она строится и кому это нужно. Плюсы использования дизайн-системы, про наследование компонентов. Документация для ui-кита и как делать это проще.',
    url: 'https://spb-frontend.ru/podcast/11',
    publishedAt: new Date('2017-10-06T22:00:00Z'),
  },
  {
    type: 'video',
    titleLanguage: 'ru',
    title: 'Argumentarium: Effector, Reatom и Redux · CSSSR',
    description:
      'Автор Reatom Артём Арутюнян, Сергей Головин и Сергей Сова обсудят стейт-менеджмент в целом и Reatom, Redux и Effector в частности.',
    url: 'https://www.youtube.com/watch?v=Ble1JXIb_hE',
    publishedAt: new Date('2019-12-25T16:25:00Z'),
  },
  {
    type: 'video',
    titleLanguage: 'en',
    title: 'Podlodka Frontend Crew #2',
    description:
      'Круглый стол: CSS-in-JS (не)нужен | Андрей Ситник, Артем Зверев, Сергей Сова, Александр Зубов',
    url: 'https://podlodka.io/crew-records',
    publishedAt: new Date('2021-08-03T14:00:00Z'),
  },
  {
    type: 'video',
    titleLanguage: 'ru',
    title: 'Argumentarium: хуки, декларативность и классы · CSSSR',
    description:
      'Так ли хороши хуки, как о них говорят, и можно ли полноценно заменить хуками методы жизненного цикла и не страдать? В нужном ли направлении развивается React или пора искать ему замену? Будем спорить и разбираться',
    url: 'https://www.youtube.com/watch?v=-KgCcIzP4Ys',
    publishedAt: new Date('2019-10-03T14:00:00Z'),
  },
  {
    type: 'video',
    titleLanguage: 'en',
    title: 'Effector SPb Meetup #2',
    description:
      'В современной frontend-разработке мы сталкиваемся с задачами уменьшения зависимостей между модулями и наглядного описания их внутренних и внешних связей, желая снизить количество ошибок и упростить тестирование. На этом митапе мы расскажем и покажем на практике, как стать эффективнее с помощью effector.',
    url: 'https://www.youtube.com/watch?v=nLYc4PaTXYk',
    publishedAt: new Date('2021-04-29T12:00:00Z'),
  },
  {
    type: 'video',
    titleLanguage: 'en',
    title: 'Effector SPb Meetup #1',
    description:
      'Effector — менеджер состояний frontend-приложений на javascript/typescript. Докладчики расскажут кому он может понадобиться, какие сущности имеет, как их комбинировать, как строить серверный рендеринг, и как устроено всё "под капотом".',
    url: 'https://www.youtube.com/watch?v=IacUIo9fXhI',
    publishedAt: new Date('2020-03-05T10:00:00Z'),
  },
  {
    type: 'article',
    titleLanguage: 'ru',
    title: 'React: особенности, перспективы, ситуация на рынке труда · Hexlet',
    description:
      'В объявлениях о поиске программистов часто встречается требование уметь работать с React. Иногда работодатели ожидают знания React не только от фронтендеров, но и от бэкенд-разработчиков. Почему эта библиотека настолько популярная, стоит ли изучать её сегодня, каковы её перспективы по мнению опытных программистов? Ответы на эти и другие вопросы читайте в обзорной статье.',
    url: 'https://ru.hexlet.io/blog/posts/biblioteka-react-review-article',
    publishedAt: new Date('2020-07-10T11:05:48.012+04:00'),
  },
  {
    type: 'video',
    titleLanguage: 'ru',
    title: '307 пакетов: Про личный бренд, комьюнити и DevRel · Space307',
    description:
      'Поговорили с Сергеем Совой о персональном бренде, обмазались новыми фичами, обсудили комьюнити вне комьюнити, а также узнали, кто на самом деле автор эффектора.',
    url: 'https://www.youtube.com/watch?v=QtsH31LD79c',
    publishedAt: new Date('2021-11-23T19:00:00+04:00'),
  },
  {
    type: 'video',
    titleLanguage: 'ru',
    title: 'Фронтенд Юность #216',
    description: 'В гостях Сергей Сова',
    url: 'https://www.youtube.com/watch?v=3QyrM02MLT4',
    publishedAt: new Date('2021-12-01T19:00:00Z'),
  },
  {
    type: 'video',
    titleLanguage: 'ru',
    title: 'Съебастьян: Ереван · Space307',
    description:
      'Продолжаем наше путешествие и рассказываем о жизни российских айтишников за пределами России. Наш гость, Frontend-архитектор Сергей Сова поделился своими впечатлениями от жизни в Ереване и рассказал, правда ли в Армении все играют в нарды 😄',
    url: 'https://www.youtube.com/watch?v=s6atItVtGxE',
    publishedAt: new Date('2022-05-24T10:00:00Z'),
  },
  {
    type: 'video',
    titleLanguage: 'ru',
    title: 'Тяжелое утро с HolyJS: архитектура и архитекторы',
    description:
      'Архитектор и архитектура – два слова которые часто вызывают споры, непонимание и холивары. Ведущие «Тяжёлого утра» позовут экспертов и архитекторов, чтобы определить, что такое архитектура и кто такие архитекторы, чему учиться и что тренировать, чтобы стать им.',
    url: 'https://live.jugru.org/video?v=MTAwMTI0ijIwMDAwMTAwijA',
    publishedAt: new Date('2022-06-10T13:50:00Z'),
  },
  {
    type: 'video',
    titleLanguage: 'ru',
    title: 'Podlodka #286 — Архитектура фронтенда',
    description:
      'Какие есть абстракции, какие есть подходы, как они между собой связаны. В первой части поговорили в верхнеуровневом разрезе уровня флоу данных, а во второй про низкоуровневые компоненты – кэши, хранилища, верстка и другие.',
    url: 'https://podlodka.io/286',
    publishedAt: new Date('2022-09-18T16:00:00Z'),
  },
  {
    type: 'video',
    titleLanguage: 'en',
    title: 'HolyJS: Effector — business logic with ease',
    description:
      'Ян Лаврюшев рассказал, какая польза от effector в качестве инструмента описания бизнес-логики.',
    url: 'https://holyjs.ru/en/talks/d14acb98dc004003a561475608760d6d/',
    publishedAt: new Date('2022-11-11T11:00:00Z'),
  },
  {
    type: 'podcast',
    titleLanguage: 'en',
    title: 'Frontend Weekend #142',
    description:
      'Сергей Сова о вынужденном даунгрейде до разработчика, Effector`е и фронтенд-архитектуре.',
    url: 'https://podcast.ru/e/.AbYIPoUcB5',
    publishedAt: new Date('2023-02-06T11:00:00Z'),
  },
  {
    type: 'video',
    titleLanguage: 'ru',
    title: 'SIBERIA CAN CODE — Effector в действии',
    description:
      'На данном стриме мы в месте с core-разработчиком effector научимся мыслить и работать с данной библиотекой. Постараемся ответить на вопросы как и когда нужно использовать effector',
    url: 'https://www.youtube.com/watch?v=a83r-YGWMBc',
    publishedAt: new Date('2023-04-30T11:00:00Z'),
  },
  {
    type: 'video',
    titleLanguage: 'ru',
    title: 'SIBERIA CAN CODE — Роутинг и фабрики в effector',
    description:
      'На данном стриме мы изучим как писать фабрики, что это такое, в каких случаях стоит использовать. А также подключим роутинг с помощью atomic-router, научимся проверять аутентификацию и показывать загрузку данных.',
    url: 'https://www.youtube.com/watch?v=a83r-YGWMBc',
    publishedAt: new Date('2023-05-06T11:00:00Z'),
  },
  {
    type: 'video',
    titleLanguage: 'ru',
    title: 'SIBERIA CAN CODE — Код ревью, запросы',
    description:
      'На данном стриме мы поревьювим код, разберем как выполнять запросы со страницы поиска рецептов, добавим infinity scroll, поотвечаем на вопросы зрителей',
    url: 'https://www.youtube.com/watch?v=DChSroCxOJE',
    publishedAt: new Date('2023-05-20T11:00:00Z'),
  },
  {
    type: 'video',
    titleLanguage: 'en',
    title: 'Podlodka React Crew #2',
    description:
      'Сергей Сова участвует в программном комитете онлайн конференции Podlodka React Crew. Это недельная конференция с экспертами из топовых компаний.',
    url: 'https://podlodka.io/reactcrew_2',
    publishedAt: new Date('2025-02-10T10:00:00Z'),
  },
]);

export function getFeaturedTalks(language: 'en' | 'ru', limit = 6) {
  return invitedContent
    .filter(
      (item) =>
        (item.type === 'video' || item.type === 'podcast') && item.titleLanguage === language,
    )
    .sort((a, b) => b.publishedAt.valueOf() - a.publishedAt.valueOf())
    .slice(0, limit);
}
