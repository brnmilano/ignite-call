import dayjs from "dayjs";
import { CaretLeft, CaretRight } from "phosphor-react";
import {
  CalendarActions,
  CalendarBody,
  CalendarContainer,
  CalendarDay,
  CalendarHeader,
  CalendarTitle,
} from "./styles";
import { getWeekDays } from "@/utils/get-week-day";
import { useState, useMemo } from "react";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useRouter } from "next/router";

/**
 * CalendarWeek - Semana do calendário.
 * Cada semana possui o número da semana: semana 1, 2, 3...
 *
 * week - Número da semana.
 * days - Dias da semana.
 * Os dias da semana são um array de objetos. Cada dia possui a data, sendo um
 * objeto do tipo dayjs.Dayjs e se está desabilitado ou não.
 *
 */
interface CalendarWeek {
  week: number;
  days: Array<{
    date: dayjs.Dayjs;
    disabled: boolean;
  }>;
}

/**
 * CalendarWeeks - Array de semanas do calendário.
 * O reduce lá embaixo precisa produzir um array no formato de CalendarWeeks.
 */
type CalendarWeeks = CalendarWeek[];

interface CalendarProps {
  selectedDate?: Date | null;
  onDateSelected: (date: Date) => void;
}

interface BlockedDates {
  blockedWeekDays: number[];
}

export function Calendar({ selectedDate, onDateSelected }: CalendarProps) {
  const router = useRouter();

  const username = String(router.query.username);

  const [currentDate, setCurrentDate] = useState(() => {
    return dayjs().set("date", 1);
  });

  function handlePreviousMonth() {
    const previousMonth = currentDate.subtract(1, "month");

    setCurrentDate(previousMonth);
  }

  function handleNextMonth() {
    const nextMonth = currentDate.add(1, "month");

    setCurrentDate(nextMonth);
  }

  const shortWeekDays = getWeekDays({ short: true });

  const currentMonth = currentDate.format("MMMM");

  const currentYear = currentDate.format("YYYY");

  const { data: blockedDates } = useQuery<BlockedDates>({
    queryKey: [
      "blockedDates",
      currentDate.get("year"),
      currentDate.get("month"),
    ],
    queryFn: async () => {
      const response = await api.get(`/users/${username}/blocked-dates`, {
        params: {
          year: currentDate.get("year"),
          month: currentDate.get("month"),
        },
      });
      return response.data;
    },
    enabled: !!selectedDate,
  });

  const calendarWeeks = useMemo(() => {
    /**
     * Array com a quantidade de dias no mês.
     *
     * length: currentDate.daysInMonth() - Retorna a quantidade de dias no mês.
     * map((_, i) => currentDate.set("date", i + 1)) - Retorna a data do dia.
     * i + 1 - Porque o mês começa do 1, não do 0.
     * currentDate.set("date", i + 1) - Retorna a data do dia.
     *
     * Exemplo:
     * currentDate.daysInMonth() = 30
     * length: 30
     */
    const daysInMonthArray = Array.from({
      length: currentDate.daysInMonth(),
    }).map((_, i) => {
      /**
       * E o dia, quando a gente trata de datas no JavaScript, sempre é date,
       * cuidado, não usa day, porque day quer dizer dia da semana.
       */
      return currentDate.set("date", i + 1);
    });

    const firstWeekDay = currentDate.get("day");

    /**
     * Array para preencher os dias do mês anterior.
     *
     * length: firstWeekDay - Retorna o primeiro dia da semana.
     */
    const previousMonthFillArray = Array.from({
      length: firstWeekDay,
    })
      .map((_, i) => {
        return currentDate.subtract(i + 1, "day");
      })
      .reverse();

    /**
     * Último dia do mês
     *
     * daysInMonth - Retorna quantos dias tenho no mês. Se eu setar o dia da data
     * (date) no total de dias do mês, eu estou pegando o último dia do mês.
     *
     * getDay retorna 6. O dia da semana do último dia do mês.
     */
    const lastDayInCurrentMonth = currentDate.set(
      "date",
      currentDate.daysInMonth()
    );

    /**
     * Último dia da semana do mês.
     *
     */
    const lastWeekDay = lastDayInCurrentMonth.get("day");

    /**
     * Retorna sempre um dia atrás, length 7, eu tenho 7 dias na semana.
     * length 7 = Dias da semana.
     * A semana começa do zero, então + 1 para começar a semana no domingo.
     *
     * lastDayInCurrentMonth = 30
     */
    const nextMonthFillArray = Array.from({
      length: 7 - (lastWeekDay + 1),
    }).map((_, i) => {
      return lastDayInCurrentMonth.add(i + 1, "day");
    });

    /**
     * Array para somar toda a lógica em apenas 1 array.
     * Soma o previousMonthFillArray, daysInMonthArray e nextMonthFillArray.
     *
     * Os dias do mês anterior e do mês seguinte são desabilitados. O usuário
     * só pode clicar nos dias do mês atual.
     *
     *
     */
    const calendarDays = [
      ...previousMonthFillArray.map((date) => {
        return { date, disabled: true };
      }),

      ...daysInMonthArray.map((date) => {
        return {
          date,
          disabled:
            date.endOf("day").isBefore(new Date()) ||
            blockedDates?.blockedWeekDays.includes(date.get("day")),
        };
      }),

      ...nextMonthFillArray.map((date) => {
        return { date, disabled: true };
      }),
    ];

    /**
     * Separa em semanas, facilidanto o map que irá renderizar os dias e semanas.
     *
     * Inicia com um array vazio. O array é os dias da semana.
     *
     * Weeks é a informação que vai ser manipulada.
     *
     *
     *
     * @param weeks - Array final que será montado. Também é o retorno da função. []
     * @param _ - Cada um dos dates do calendarDays. Não é utilizado.
     * @param i - Index do calendarDays.
     * @param original - Array original sem nenhuma alteração.
     */
    const calendarWeeks = calendarDays.reduce<CalendarWeeks>(
      (weeks, _, i, original) => {
        /**
         * Variavel que indica se a semana chegou no fim.
         * Se o resto da divisão por 7 for 0, é porque a semana chegou no fim.
         *
         * Se o meu indice não for divisivel por 7, não quebra a semana.
         */
        const isNewWeek = i % 7 === 0;

        /**
         * Se a semana não terminou,
         */
        if (isNewWeek) {
          /**
           * Aqui vai dar, semana 1, 2, 3...
           *
           * Days é um array de objetos. Cada objeto é um dia.
           */
          weeks.push({
            week: i / 7 + 1,
            days: original.slice(i, i + 7),
          });
        }

        return weeks;
      },
      []
    );

    return calendarWeeks;
  }, [currentDate, blockedDates]);

  return (
    <>
      <Head>
        <title>Agenda</title>
      </Head>

      <CalendarContainer>
        <CalendarHeader>
          <CalendarTitle>
            {currentMonth} <span>{currentYear}</span>
          </CalendarTitle>

          <CalendarActions>
            <button onClick={handlePreviousMonth} title="Previous month">
              <CaretLeft />
            </button>

            <button onClick={handleNextMonth} title="Next month">
              <CaretRight />
            </button>
          </CalendarActions>
        </CalendarHeader>

        <CalendarBody>
          <thead>
            <tr>
              {shortWeekDays.map((weekDay) => (
                <th key={weekDay}>{weekDay}.</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* 
            calendarWeeks é o array de semanas.
            cada semana é um objeto com a semana e os dias.

            item.date.toString() - pega um único dia.
          */}
            {calendarWeeks.map((item: any) => {
              return (
                <tr key={item.week}>
                  {item.days.map((item: any) => {
                    return (
                      <td key={item.date.toString()}>
                        <CalendarDay
                          onClick={() => onDateSelected(item.date.toDate())}
                          disabled={item.disabled}
                        >
                          {item.date.get("date")}
                        </CalendarDay>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </CalendarBody>
      </CalendarContainer>
    </>
  );
}
