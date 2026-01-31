'use client';

import { Button } from '@/components/ui/button';
import TelegramWalletLogin from '@/components/TelegramWalletLogin';
import tweetsData from '../../../../../tweets.json';
import { BarChart2, Bookmark, Heart, MessageCircle, Quote, Repeat2 } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

type TweetItem = {
  user: {
    name: string;
    screenName: string;
    profileImageUrlHttps: string;
  };
  text: string;
  stats: {
    favoriteCount: number;
    retweetCount: number;
    bookmarkCount: number;
    viewCount: number;
    quoteCount: number;
    replyCount: number;
  };
  dates: {
    createdAt: string;
    updatedAt: string;
  };
};

const targetUsers = [
  'cz_binance',
  'heyibinance',
  'nake13',
  'gogo_allen15',
  'DonaldTrump',
  'jiangplus',
  'alan_ywang',
  'pawx_ai',
  '1dot2',
  'elonmusk',
  'p3shoemaker',
  'brockjelmore',
  'cbd1913',
];

const formatCount = (count?: number) => {
  if (!count) {
    return '0';
  }
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return count.toString();
};

export default function SniperPage() {
  const tweets = tweetsData as TweetItem[];

  const availableAccounts = useMemo(() => {
    const accountMap = new Map<string, { screenName: string; name: string; profileImageUrl: string }>();
    tweets.forEach((tweet) => {
      const { screenName, name, profileImageUrlHttps } = tweet.user;
      if (targetUsers.includes(screenName) && !accountMap.has(screenName)) {
        accountMap.set(screenName, {
          screenName,
          name,
          profileImageUrl: profileImageUrlHttps,
        });
      }
    });

    return targetUsers
      .filter(user => accountMap.has(user))
      .map(user => accountMap.get(user)!);
  }, [tweets]);

  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(
    () => availableAccounts.map(account => account.screenName),
  );

  const filteredTweets = useMemo(() => {
    return tweets
      .filter(tweet => selectedAccounts.includes(tweet.user.screenName))
      .sort((a, b) => new Date(b.dates.createdAt).getTime() - new Date(a.dates.createdAt).getTime());
  }, [tweets, selectedAccounts]);

  const handleToggle = (screenName: string) => {
    setSelectedAccounts(prev => (
      prev.includes(screenName)
        ? prev.filter(item => item !== screenName)
        : [...prev, screenName]
    ));
  };

  const handleSelectAll = () => {
    setSelectedAccounts(availableAccounts.map(account => account.screenName));
  };

  const handleClearAll = () => {
    setSelectedAccounts([]);
  };

  return (
    <div className="min-h-[calc(100vh-84px)] w-full bg-gray-100 dark:bg-gray-500">
      <div className="mx-auto max-w-screen-xl space-y-6 p-6">
        <TelegramWalletLogin />

        <div className="rounded-2xl border border-gray-200 bg-white/90 shadow-sm dark:border-gray-600 dark:bg-gray-700/80">
          <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-gray-600 dark:bg-gray-800/80">
            <div className="flex items-center gap-3">
              <Image src="/X.jpg" alt="X" width={22} height={22} className="shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tweet Feed</h2>
              </div>
            </div>
          </header>

          <div className="flex flex-col gap-6 p-6 lg:flex-row">
            <aside className="w-full shrink-0 rounded-xl border border-gray-200 bg-white/70 p-4 shadow-sm dark:border-gray-600 dark:bg-gray-800/60 lg:w-72">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filter Accounts</h3>
                <span className="text-xs text-gray-500 dark:text-gray-300">
                  Selected
                  {' '}
                  {selectedAccounts.length}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="h-7 px-2" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleClearAll}>
                  Clear
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {availableAccounts.map(account => (
                  <label
                    key={account.screenName}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-600 dark:hover:bg-gray-700/60"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes(account.screenName)}
                      onChange={() => handleToggle(account.screenName)}
                      className="size-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <Image
                      src={account.profileImageUrl || '/default-avatar.png'}
                      alt={account.name}
                      width={36}
                      height={36}
                      className="size-9 rounded-full"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {account.name}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-300">
                        @
                        {account.screenName}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </aside>

            <section className="flex-1 space-y-4">
              {filteredTweets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white/70 p-12 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
                  Select at least one account to view tweets
                </div>
              ) : (
                filteredTweets.map((tweet, index) => (
                  <article
                    key={`${tweet.user.screenName}-${tweet.dates.createdAt}-${index}`}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-600 dark:bg-gray-800/60"
                  >
                    <div className="flex items-start gap-3">
                      <Image
                        src={tweet.user.profileImageUrlHttps || '/default-avatar.png'}
                        alt={tweet.user.name}
                        width={44}
                        height={44}
                        className="size-11 rounded-full"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {tweet.user.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-300">
                            @
                            {tweet.user.screenName}
                          </span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-400">
                            {new Date(tweet.dates.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
                          {tweet.text}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-300">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="size-4" />
                            {formatCount(tweet.stats.replyCount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Repeat2 className="size-4" />
                            {formatCount(tweet.stats.retweetCount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="size-4" />
                            {formatCount(tweet.stats.favoriteCount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bookmark className="size-4" />
                            {formatCount(tweet.stats.bookmarkCount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Quote className="size-4" />
                            {formatCount(tweet.stats.quoteCount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart2 className="size-4" />
                            {formatCount(tweet.stats.viewCount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
