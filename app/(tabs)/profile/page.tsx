import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";

async function getUser() {
    const session = await getSession();
    if (session.id) {
        const user = await db.user.findUnique({
            where: {
                id: session.id,
            },
        });
        if (user) {
            return user;
        }
    }
    notFound();
}

export default async function Page() {
    const user = await getUser();
    const logOut = async () => {
        "use server";
        const session = await getSession();
        session.destroy();
        redirect("/");
    };
    // form 안에 button이 1개만 있을 경우 버튼을 누르면 submit이 되어 form의 action이 실행됨
    // 버튼의 갯수가 여러개일시 x
    // input type="submit"으로도 사용 가능
    return (
        <div>
            <h1>Welcome {user?.username}!!</h1>
            <form action={logOut}>
                <button>Log out</button>
            </form>
        </div>
    );
}
