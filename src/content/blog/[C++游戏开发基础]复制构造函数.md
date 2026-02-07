# [C++游戏开发基础]:深入解析复制构造函数

考虑下面程序:

```cpp
#include <iostream>

class Fraction
{
private:
    int m_numerator{ 0 };
    int m_denominator{ 1 };

public:
    // Default constructor
    Fraction(int numerator=0, int denominator=1)
        : m_numerator{numerator}, m_denominator{denominator}
    {
    }

    void print() const
    {
        std::cout << "Fraction(" << m_numerator << ", " << m_denominator << ")\n";
    }
};

int main()
{
    Fraction f { 5, 3 };  // 1
    Fraction fCopy { f }; // 2

    f.print();
    fCopy.print();

    return 0;
}
```

在上面的代码中,除了一系列熟悉的配方之外,我们还发现在25行有一行之前没见过的代码,就是你想的那样,这个就是本文的主角-复制构造函数。 

复制构造函数也是一种构造函数(有一种听君一席话的感觉😊)。用于使用相同类型的现有对象初始化对象,在复制构造函数执行之后,在复制构造函数执行完后，新对象应该是传入的已有对象的副本（拷贝）。

---

## 隐式复制构造函数

如果你没有为你的类提供复制构造函数，C++将为你创建一个公共**隐式复制构造函数** 。在上面的示例中，语句 `Fraction fCopy { f };` 调用隐式复制构造函数来用 `f` 初始化 `fCopy`。

默认情况下，隐式复制构造函数将进行成员初始化。这意味着每个成员都将使用传入的类的相应成员作为初始化器进行初始化。在上例中，`fCopy.m_numerator` 使用 `f.m_numerator`（值为 `5`）初始化，`fCopy.m_denominator` 使用 `f.m_denominator`（值为 `3`）初始化。

在执行复制构造函数之后，`f` 和 `fCopy` 的成员具有相同的值，因此 `fCopy` 是 `f` 的副本。因此，调用 `print（）在`任何一个上都有相同的结果。

---

## 显式定义自己的复制构造函数

我们也可以显式的定义自己的复制构造函数。比如下面的示例中,我们将在自己定义的复制构造函数中打印一条消息,以便于提示我们,自己定义的复制构造函数被成功调用。 

```cpp
#include<iostream>

class Fraction
{
private:
    int m_numberator {0};
    int m_denominator {1};
public:
    Fraction(int numerator = 0, int denominator = 1)
    :m_numberator{numerator}
    ,m_denominator{denominator}
    {}

    // 复制构造函数
    Fraction(const Fraction& fraction)
    :m_numberator{fraction.m_numberator}
    ,m_denominator{fraction.m_denominator}
    {
        std::cout <<"Copy constructor called\n";
    }

    void print()
    {
        std::cout <<"Fraction(" << m_numberator << "," << m_denominator << ")\n";
    }
};

int main()
{
    Fraction f {5,3};
    Fraction fCopy{f}; // 复制构造函数

    f.print();
    fCopy.print();

    return 0;
}

```

![image-20250324165906674](https://images.waer.ltd/notes/202503241659794.png)

**提醒⏰**

> 访问控制是 **基于类**而不是 **基于对象**的。这意味着,同一个类的成员函数可以访问任意该类对象的私有成员（不仅仅是当前对象 this 的私有成员）。
>
> 在上面的 Fraction 复制构造函数中，我们利用了这一特性，直接访问了 fraction 参数的私有成员。否则，我们将无法直接访问这些成员（除非添加访问函数，但这里显然没那个必要）。

**最佳实践**

> - 复制构造函数不应该做除了复制以外的其他工作。
> - 除非你有特定必要的理由创建自己的复制构造函数,否则请首选使用隐式复制构造函数。

---

## 复制构造函数的参数必须是引用类型

- 当一个对象 **按值传递（pass by value）** 时，函数参数会接收到 **原始对象的副本**，而不是直接操作原对象。如果传递的对象与参数是 **相同的类类型**，那么**复制过程**是通过 **隐式调用拷贝构造函数（copy constructor）** 来完成的。

看个例子:

```cpp

#include <iostream>

class Fraction
{
private:
    int m_numerator{ 0 };   // 分子，默认为 0
    int m_denominator{ 1 }; // 分母，默认为 1

public:
    // 默认构造函数（带默认参数）
    Fraction(int numerator = 0, int denominator = 1)
        : m_numerator{ numerator }, m_denominator{ denominator }
    {
    }

    // 拷贝构造函数
    Fraction(const Fraction& fraction)
        : m_numerator{ fraction.m_numerator }  // 复制分子
        , m_denominator{ fraction.m_denominator }  // 复制分母
    {
        std::cout << "复制构造函数被调用\n";  // 输出信息，确认拷贝构造函数被调用
    }

    // 打印分数
    void print() const
    {
        std::cout << "Fraction(" << m_numerator << ", " << m_denominator << ")\n";
    }
};

// 按值传递 Fraction 对象（会调用拷贝构造函数）
void printFraction(Fraction f) // f 按值传递，会创建副本
{
    f.print(); // 调用 Fraction 类的 print() 方法
}

int main()
{
    Fraction f{ 5, 3 }; // 创建 Fraction 对象 f，调用普通构造函数

    printFraction(f); // 传递 f 到 printFraction 函数，按值传递，会调用拷贝构造函数

    return 0;
}

```

在上面的例子中，对 `printFraction（f）` 的调用是通过值传递 `f`。调用复制构造函数将 `f` 从 `main` 复制到函数 `printFraction（）` 的 `f` 参数中。

在 C++ 中，**拷贝构造函数（Copy Constructor）的参数必须是** const **引用**，不能按值传递，否则会导致 **无限递归**，最终导致 **栈溢出（stack overflow）**。

```cpp
class MyClass
{
public:
    MyClass(MyClass obj) // ❌ 错误：按值传递拷贝构造函数
    {
        std::cout << "Copy Constructor Called\n";
    }
};
```

> 当你尝试创建一个新对象（例如 MyClass obj2 = obj1;），编译器会这样做：
>
> 1. obj1 需要被**复制**到 obj 这个参数中（因为按值传递）。
> 2. 但 obj 也是一个 MyClass 类型的对象，所以需要调用 **拷贝构造函数** 来复制 obj1。
> 3. **调用拷贝构造函数时，又要传递 obj 这个参数（按值传递）**，因此：
>    1. **又会调用拷贝构造函数**
>    2. **拷贝构造函数又需要传递 obj**
>    3. **进入无限递归的调用链**
> 4. 最终 **栈溢出（Stack Overflow）**，程序崩溃。

---

如果一个类没有复制构造函数，编译器将隐式地为我们生成一个。如果我们愿意，我们可以显式地告诉编译器使用 `= default` 语法为我们创建一个默认的复制构造函数：

```cpp
#include <iostream>

class Fraction
{
private:
    int m_numerator{ 0 };
    int m_denominator{ 1 };

public:
    // 默认构造函数
    Fraction(int numerator=0, int denominator=1)
        : m_numerator{numerator}, m_denominator{denominator}
    {
    }

    
    Fraction(const Fraction& fraction) = default;

    void print() const
    {
        std::cout << "Fraction(" << m_numerator << ", " << m_denominator << ")\n";
    }
};

int main()
{
    Fraction f { 5, 3 };
    Fraction fCopy { f };

    f.print();
    fCopy.print();

    return 0;
}
```

---

## 使用 `=delete`防止复制

有时候我们会遇到这样的需求,我们不希望某个类的对象是可以复制的,我们可以通过使用`=delete`来将复制构造函数标记为删除以实现该需求。

```cpp
#include <iostream>

class Fraction
{
private:
    int m_numerator{ 0 };
    int m_denominator{ 1 };

public:
    // Default constructor
    Fraction(int numerator=0, int denominator=1)
        : m_numerator{numerator}, m_denominator{denominator}
    {
    }

    // 删除复制构造函数 无法再复制
    Fraction(const Fraction& fraction) = delete;

    void print() const
    {
        std::cout << "Fraction(" << m_numerator << ", " << m_denominator << ")\n";
    }
};

int main()
{
    Fraction f { 5, 3 };
    Fraction fCopy { f }; //编译错误

    return 0;
}
```

在这个例子中，当编译器去寻找一个构造函数来用 `f` 初始化 `fCopy` 时，它会发现复制构造函数已经被删除了。这将导致它发出编译错误。

> 通常，C++ 类的 **拷贝构造函数** 是 public 的，这样外部代码（例如按值传递对象、对象赋值等）可以正常复制对象。但如果你 **不希望对象被随意复制**，可以将拷贝构造函数设为 private，这样就无法在类外部进行复制。
>
> 然而，这样做有一个例外：**类的成员函数仍然可以访问私有拷贝构造函数**，所以如果你的类内部有某些代码仍然需要复制对象，这个方法就不适合。

```cpp
#include <iostream>

class NonCopyable
{
private:
    // 私有拷贝构造函数，防止外部复制
    NonCopyable(const NonCopyable& other) 
    {
        std::cout << "拷贝构造函数被调用\n";
    }

public:
    // 默认构造函数
    NonCopyable() 
    {
        std::cout << "默认构造函数被调用\n";
    }

    void show() const 
    {
        std::cout << "我是一个 NonCopyable 对象\n";
    }
};

int main()
{
    NonCopyable obj1; // ✅ 调用默认构造函数

    // NonCopyable obj2 = obj1; // ❌ 这里会报错，因为拷贝构造函数是 private 的
    // printNonCopyable(obj1);  // ❌ 这里也会报错，按值传递需要拷贝

    return 0;
}
```

---

## 类初始化和复制省略

先回顾一下具有基本数据类型的对象的6种基本初始化方式:

```cpp
int a;         // 没有初始化器（默认初始化）  
int b = 5;     // 在等号后使用初始化器（拷贝初始化）  
int c(6);      // 使用括号内的初始化器（直接初始化）  

// 列表初始化方法（C++11）  
int d { 7 };   // 使用大括号的初始化器（直接列表初始化）  
int e = { 8 }; // 在等号后使用大括号的初始化器（拷贝列表初始化）  
int f {};      // 初始化器为空的大括号（值初始化）  
```

所有这些初始化类型对于具有类类型的对象都是有效的：

```cpp
#include <iostream>

class Foo
{
public:

    // 默认构造函数（无参数）
    Foo()
    {
        std::cout << "Foo()\n";
    }

    // 普通构造函数（带一个 int 参数）
    Foo(int x)
    {
        std::cout << "Foo(int) " << x << '\n';
    }

    // 拷贝构造函数（用于复制已有对象）
    Foo(const Foo&)
    {
        std::cout << "Foo(const Foo&)\n";
    }
};

int main()
{
    // 调用 Foo() 默认构造函数
    Foo f1;           // 默认初始化
    Foo f2{};         // 值初始化（推荐）

    // 调用 Foo(int) 普通构造函数
    Foo f3 = 3;       // 拷贝初始化（仅适用于非 explicit 构造函数）
    Foo f4(4);        // 直接初始化
    Foo f5{ 5 };      // 直接列表初始化（推荐）
    Foo f6 = { 6 };   // 拷贝列表初始化（仅适用于非 explicit 构造函数）

    // 调用 Foo(const Foo&) 拷贝构造函数
    Foo f7 = f3;      // 拷贝初始化
    Foo f8(f3);       // 直接初始化
    Foo f9{ f3 };     // 直接列表初始化（推荐）
    Foo f10 = { f3 }; // 拷贝列表初始化

    return 0;
}
```

在现代C++中,复制初始化、直接初始化和列表初始化的本质做的都是同一件事: **初始化一个对象**。

对于所有类型的初始化:

- 初始化类类型时,将检查该类的构造函数集,并使用重载解析来确定最佳匹配的构造函数。这可能涉及参数的隐式转换。
- 初始化非类类型时,编译器会使用**隐式转换规则**来检查是否可以将提供的值转换为目标类型。

> 同样值得注意的是，在某些情况下，某些形式的初始化是不允许的（例如，在构造函数成员初始化列表中，我们只能使用直接形式的初始化，而不能复制初始化）。

---

## 不必要的复制

考虑下面的程序:

```cpp
#include<iostream>

class Something
{
  int m_x {};
public:
    Something(int x) : m_x{x}
    {
        std::cout <<"Normal constructor called\n";
    }

    Something(const Something& s):m_x {s.m_x}
    {
        std::cout << "Copy constructor\n";
    }

    void print() const
    {
        std::cout << "Something(" << m_x << ")\n";
    }
};

int main()
{
    Something s {Something {6}};
    s.print();

    return 0;
}

```

在上面的变量`s`的初始化中,我们首先构造一个临时的`Something`,初始化值为`6`. 然后使用这个临时变量来初始化`s`  ,因为临时对象和 `s` 具有相同的类型（它们都是 `Something` 对象），所以这里通常会调用 `Something（const Something）` 复制构造函数来将临时对象中的值复制到 `s` 中。最终结果是 `s` 被初始化为值 `6`。

在**没有任何优化**的情况下,上面的程序将会打印:

```cpp
Normal constructor
Copy constructor
Something(5)
```

然而，这个程序是不必要的低效率，因为我们必须进行两次构造函数调用：一次是对 Something（int），另一次是对 `Something（const Something&）`。请注意，上面的最终结果与我们编写以下代码的结果相同：

```cpp
Something s { 5 }; 
```

---

## 复制消除

由于编译器可以自由地重写语句来优化它们，人们可能会想，编译器是否可以优化掉不必要的副本，并将 `Something s { Something{5} }` 视为我们最终的写法。

答案是肯定的，这样做的过程被称为*复制省略* 。 **复制省略**是一种编译器优化技术，它允许编译器删除不必要的对象复制。

换句话说，在编译器通常会调用复制构造函数的情况下，编译器可以自由地重写代码以完全避免对复制构造函数的调用。当编译器优化掉对复制构造函数的调用时，我们说该构造函数已被**省略** 。

与其他类型的优化不同，复制省略不受“as-if”规则的约束。也就是说，允许复制省略来省略复制构造函数，即使复制构造函数还会执行其他任务。

这就是前面为什么说 **复制构造函数不应该存在除复制功能之外其他操作**的原因。 

所以上面的程序如果在C++17环境下编译,那么你的打印将和我一样:

![image-20250324175809736](https://images.waer.ltd/notes/202503241758804.png)

---

## **C++17 中的强制复制省略**

在 `C++`17 之前，复制省略是编译器可以进行的严格的可选优化。在 `C++17` 中，复制省略在某些情况下是强制性的。在这些情况下，复制省略将自动执行（即使您告诉编译器不要执行复制省略）。

- 在可选的省略情况下，可访问的复制构造函数必须可用（例如未删除），即使对复制构造函数的实际调用被省略。
- 在强制省略的情况下，可访问的复制构造函数不需要可用（换句话说，即使删除了复制构造函数，也会发生强制省略）。

---

## 提一嘴explict

在 `C++` 中，`explicit` 关键字用于修饰**构造函数**和**转换运算符**，它的主要作用是**防止隐式转换**，确保类的对象不会被意外地从其他类型的值隐式构造。

- **默认情况下，应该将所有接受单个参数的构造函数声明为 explicit。**
  - 这样可以防止**隐式类型转换**，避免意外的类型转换导致的错误。
- **如果某种类型转换在语义上是合理的，并且性能上没有问题，则可以考虑不使用 explicit，允许隐式转换。**
  - 例如，如果类 `String` 有一个接受 `const char*` 的构造函数，并且允许从 `const char*` 隐式转换为 `String` 是合理的，可以去掉 `explicit`。
- **不要将拷贝构造函数或移动构造函数声明为 explicit，因为它们并不会进行类型转换。**
  - 拷贝构造`（T(const T&)）`和移动构造（`T(T&&)）`的作用是复制或移动相同类型的对象，而不是进行类型转换，因此不应该加 `explicit`，否则会影响对象的正常复制和移动操作。

示例:

**✅ 正确：使用 explicit 防止隐式转换**

```cpp
class Foo
{
public:
    explicit Foo(int x) // ✅ 默认加 explicit，防止隐式转换
    {
        std::cout << "Foo(int) called with " << x << '\n';
    }
};

void printFoo(Foo f) {}

int main()
{
    Foo f1 = 10; // ❌ 编译错误：explicit 禁止了隐式转换
    Foo f2(10);  // ✅ 直接初始化可以
    printFoo(10); // ❌ 编译错误，无法从 int 隐式转换为 Foo
}
```

**✅ 合理去掉 explicit 允许隐式转换**

```cpp
class String
{
public:
    String(const char* str) // ✅ 允许从 const char* 隐式转换为 String
    {
        std::cout << "String constructor called\n";
    }
};

void printString(String s) {}

int main()
{
    printString("Hello"); // ✅ 允许隐式转换
}
```

**❌ 不要给拷贝/移动构造函数加 explicit**

```cpp
class Bar
{
public:
    Bar(const Bar&) = default; // ✅ 正确，拷贝构造函数不应 explicit
    Bar(Bar&&) = default;      // ✅ 正确，移动构造函数不应 explicit
};
```

> 如果加上 `explicit`，将会导致 `Bar b2 = b1`; 无法编译。

| **规则**                                    | **解释**                                            |
| ------------------------------------------- | --------------------------------------------------- |
| **单参数构造函数默认 explicit**             | 防止意外的隐式转换                                  |
| **如果隐式转换合理且高效，可去掉 explicit** | 例如 String(const char*)                            |
| **拷贝/移动构造函数不要 explicit**          | 这些构造函数不会执行类型转换，避免影响正常复制/移动 |

